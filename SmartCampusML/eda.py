import os
import sys
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from utils import setup_logging, print_banner

logger = setup_logging()
sns.set_theme(style="whitegrid")

class EDAAnalyser:
    def __init__(self, dataset_path, outputs_dir):
        self.dataset_path = dataset_path
        self.outputs_dir = outputs_dir
        self.df = None
        self.plots_dir = os.path.join(outputs_dir, "plots")
        self.reports_dir = os.path.join(outputs_dir, "reports")
        
        os.makedirs(self.plots_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)

    def load_data(self):
        """Loads preprocessed dataset for exploration."""
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Processed dataset not found at {self.dataset_path}")
        self.df = pd.read_csv(self.dataset_path)
        logger.info(f"Loaded {len(self.df)} records for Exploratory Data Analysis.")

    def run_analysis(self):
        """Generates statistical calculations, visualizations, and logs conclusions."""
        print_banner("Step 3: Exploratory Data Analysis")
        if self.df is None:
            raise ValueError("Data must be loaded before running EDA.")

        # 1. Descriptive Statistics
        desc_stats = self.df.describe()
        desc_stats_path = os.path.join(self.reports_dir, "descriptive_statistics.csv")
        desc_stats.to_csv(desc_stats_path)
        logger.info("\n--- Descriptive Statistics Summary (saved to reports/descriptive_statistics.csv) ---")
        
        # 2. Correlation Matrix
        numeric_df = self.df.select_dtypes(include=["number"])
        corr_matrix = numeric_df.corr()
        corr_matrix_path = os.path.join(self.reports_dir, "correlation_matrix.csv")
        corr_matrix.to_csv(corr_matrix_path)
        
        # 3. Correlation Heatmap
        plt.figure(figsize=(16, 12))
        sns.heatmap(corr_matrix, annot=False, cmap="coolwarm", fmt=".2f", linewidths=0.5)
        plt.title("Campus Variables Correlation Heatmap")
        plt.tight_layout()
        heatmap_path = os.path.join(self.plots_dir, "correlation_heatmap.png")
        plt.savefig(heatmap_path, dpi=300)
        plt.close()
        logger.info(f" - Correlation Heatmap saved to {heatmap_path}")

        # 4. Electricity Consumption Distribution
        plt.figure()
        sns.histplot(self.df["Electricity_Consumption_kWh"], kde=True, color="#4f46e5", bins=30)
        plt.title("Distribution of Electricity Consumption")
        plt.xlabel("Consumption (kWh)")
        plt.ylabel("Frequency")
        plt.tight_layout()
        dist_path = os.path.join(self.plots_dir, "electricity_consumption_dist.png")
        plt.savefig(dist_path, dpi=300)
        plt.close()

        # 5. Temperature Distribution
        plt.figure()
        sns.histplot(self.df["Temperature_C"], kde=True, color="#f43f5e", bins=20)
        plt.title("Distribution of Campus Temperature")
        plt.xlabel("Temperature (°C)")
        plt.ylabel("Frequency")
        plt.tight_layout()
        temp_path = os.path.join(self.plots_dir, "temperature_dist.png")
        plt.savefig(temp_path, dpi=300)
        plt.close()

        # 6. Solar Generation Distribution
        plt.figure()
        sns.histplot(self.df["Solar_Generation_kWh"], kde=True, color="#10b981", bins=20)
        plt.title("Distribution of Solar Power Generation")
        plt.xlabel("Solar Generation (kWh)")
        plt.ylabel("Frequency")
        plt.tight_layout()
        solar_path = os.path.join(self.plots_dir, "solar_generation_dist.png")
        plt.savefig(solar_path, dpi=300)
        plt.close()

        # 7. Student Occupancy Distribution
        plt.figure()
        student_cols = [c for c in self.df.columns if "Students" in c and "Total" not in c]
        total_students = self.df[student_cols].sum(axis=1)
        sns.histplot(total_students, kde=True, color="#8b5cf6", bins=25)
        plt.title("Distribution of Total Campus Student Occupancy")
        plt.xlabel("Total Students")
        plt.ylabel("Frequency")
        plt.tight_layout()
        occupancy_path = os.path.join(self.plots_dir, "student_occupancy_dist.png")
        plt.savefig(occupancy_path, dpi=300)
        plt.close()

        # 8. Electricity Consumption Trend
        plt.figure(figsize=(12, 6))
        subset_df = self.df.head(168).copy()
        subset_df["Datetime"] = pd.to_datetime(subset_df["Date"] + " " + subset_df["Time"])
        plt.plot(subset_df["Datetime"], subset_df["Electricity_Consumption_kWh"], color="#4f46e5")
        plt.title("Electricity Consumption Trend (First Week of June 2026)")
        plt.xlabel("Datetime")
        plt.ylabel("Electricity Consumption (kWh)")
        plt.xticks(rotation=30)
        plt.tight_layout()
        trend_path = os.path.join(self.plots_dir, "electricity_consumption_trend.png")
        plt.savefig(trend_path, dpi=300)
        plt.close()

        # 9. Feature Correlation with Target
        target_corr = corr_matrix["Electricity_Consumption_kWh"].sort_values(ascending=False)
        target_corr_path = os.path.join(self.reports_dir, "target_correlation.csv")
        target_corr.to_csv(target_corr_path)
        
        plt.figure(figsize=(10, 8))
        target_corr.drop("Electricity_Consumption_kWh").plot(kind="barh", color="#06b6d4")
        plt.title("Feature Correlations with Target Variable")
        plt.xlabel("Pearson Correlation Coefficient")
        plt.ylabel("Features")
        plt.tight_layout()
        corr_target_path = os.path.join(self.plots_dir, "feature_correlation_with_target.png")
        plt.savefig(corr_target_path, dpi=300)
        plt.close()

if __name__ == "__main__":
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(base_dir, "data", "processed", "preprocessed_data.csv")
        outputs_dir = os.path.join(base_dir, "outputs")

        eda = EDAAnalyser(dataset_path, outputs_dir)
        eda.load_data()
        eda.run_analysis()
        logger.info("EDA completed successfully!")
    except Exception as e:
        logger.exception(f"EDA failed: {str(e)}")
