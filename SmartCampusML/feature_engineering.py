import os
import pandas as pd
from utils import setup_logging, print_banner

logger = setup_logging()

class FeatureEngineer:
    def __init__(self, input_csv_path):
        self.input_csv_path = input_csv_path
        self.df = None

    def load_data(self):
        """Loads preprocessed CSV data."""
        if not os.path.exists(self.input_csv_path):
            raise FileNotFoundError(f"Preprocessed CSV file not found at {self.input_csv_path}")
        self.df = pd.read_csv(self.input_csv_path)
        logger.info(f"Loaded {len(self.df)} rows from {self.input_csv_path} for feature engineering.")

    def engineer_features(self):
        """Creates engineered features keeping original columns intact."""
        print_banner("Step 4: Feature Engineering")
        if self.df is None:
            raise ValueError("Data must be loaded before running feature engineering.")

        logger.info("Engineering new features...")

        # 1. Total Academic Block Students
        ab_cols = ["AB1_Students", "AB2_Students", "AB3_Students", "AB4_Students", "AB5_Students"]
        self.df["Total_AB_Students"] = self.df[ab_cols].sum(axis=1)
        logger.info(" - Created 'Total_AB_Students'")

        # 2. Total M Block Students
        mab_cols = ["MAB1_Students", "MAB2_Students", "MAB3_Students", "MAB4_Students"]
        self.df["Total_MAB_Students"] = self.df[mab_cols].sum(axis=1)
        logger.info(" - Created 'Total_MAB_Students'")

        # 3. Total Students
        self.df["Total_Students"] = self.df["Total_AB_Students"] + self.df["Total_MAB_Students"]
        logger.info(" - Created 'Total_Students'")

        # 4. Total Hostel Load
        self.df["Total_Hostel_Load"] = self.df["Boys_Hostel_Load_kWh"] + self.df["Girls_Hostel_Load_kWh"]
        logger.info(" - Created 'Total_Hostel_Load'")

        # 5. Total Active Labs
        self.df["Total_Active_Labs"] = self.df["Active_Windows_Labs"] + self.df["Active_Mac_Labs"]
        logger.info(" - Created 'Total_Active_Labs'")

        logger.info(f"Feature engineering completed. New columns: "
                    f"Total_AB_Students, Total_MAB_Students, Total_Students, Total_Hostel_Load, Total_Active_Labs")
        return self.df

    def save_features(self, output_csv_path):
        """Saves final dataset with engineered features."""
        if self.df is None:
            raise ValueError("No dataframe to save.")
        self.df.to_csv(output_csv_path, index=False)
        logger.info(f"Feature engineered dataset saved to {output_csv_path}")

if __name__ == "__main__":
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        input_path = os.path.join(base_dir, "data", "processed", "preprocessed_data.csv")
        output_path = os.path.join(base_dir, "data", "processed", "feature_engineered_dataset.csv")

        fe = FeatureEngineer(input_path)
        fe.load_data()
        fe.engineer_features()
        fe.save_features(output_path)
        logger.info("Feature engineering step completed successfully!")
    except Exception as e:
        logger.exception(f"Feature engineering failed: {str(e)}")
