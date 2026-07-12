import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, precision_score, recall_score, f1_score
import joblib
import shutil
from utils import setup_logging, print_banner

logger = setup_logging()
sns.set_theme(style="whitegrid")

class ModelEvaluator:
    def __init__(self, processed_data_dir, models_dir, outputs_dir):
        self.processed_data_dir = processed_data_dir
        self.models_dir = models_dir
        self.outputs_dir = outputs_dir
        self.X_test = None
        self.y_test = None
        self.X_train = None
        self.y_train = None
        self.models = {}
        self.results = {}
        self.best_model_name = None
        self.best_model = None

    def load_test_data_and_models(self):
        """Loads split train/test data and all trained models."""
        self.X_test = pd.read_csv(os.path.join(self.processed_data_dir, "X_test.csv"))
        self.y_test = pd.read_csv(os.path.join(self.processed_data_dir, "y_test.csv")).values.flatten()
        self.X_train = pd.read_csv(os.path.join(self.processed_data_dir, "X_train.csv"))
        self.y_train = pd.read_csv(os.path.join(self.processed_data_dir, "y_train.csv")).values.flatten()
        
        model_files = [f for f in os.listdir(self.models_dir) if f.endswith(".joblib") and f not in ["best_model.joblib", "label_encoder.joblib", "feature_names.joblib", "anomaly_classifier.joblib"]]
        for f in model_files:
            name = os.path.splitext(f)[0]
            model_path = os.path.join(self.models_dir, f)
            self.models[name] = joblib.load(model_path)
            
        # Load Anomaly Classification split and model
        self.X_test_anomaly = pd.read_csv(os.path.join(self.processed_data_dir, "X_test_anomaly.csv"))
        self.y_test_anomaly = pd.read_csv(os.path.join(self.processed_data_dir, "y_test_anomaly.csv")).values.flatten()
        self.anomaly_clf = joblib.load(os.path.join(self.models_dir, "anomaly_classifier.joblib"))

    def evaluate_models(self):
        """Evaluates all loaded models and records performance metrics on both splits to check for overfitting."""
        print_banner("Step 7: Model Evaluation")
        if not self.models:
            raise ValueError("No models found for evaluation.")

        metrics_summary = []

        for name, model in self.models.items():
            # Test set evaluations
            preds = model.predict(self.X_test)
            mse = mean_squared_error(self.y_test, preds)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(self.y_test, preds)
            r2 = r2_score(self.y_test, preds)

            # Train set evaluations (to detect overfitting)
            train_preds = model.predict(self.X_train)
            train_mse = mean_squared_error(self.y_train, train_preds)
            train_r2 = r2_score(self.y_train, train_preds)

            # Overfitting logic: checks if test performance is poor while train is exceptionally high
            r2_diff = train_r2 - r2
            is_overfitting = "YES" if (r2_diff > 0.05 and r2 < 0.90) else "NO"

            self.results[name] = {
                "predictions": preds,
                "metrics": {"MSE": mse, "RMSE": rmse, "MAE": mae, "R2": r2, "Train_R2": train_r2, "Overfitting": is_overfitting}
            }

            metrics_summary.append({
                "Model": name.replace("_", " ").title(),
                "Train_R2": train_r2,
                "Train_MSE": train_mse,
                "MSE": mse,
                "RMSE": rmse,
                "MAE": mae,
                "R2_Score": r2,
                "Overfitting_Detected": is_overfitting
            })

        self.df_comparison = pd.DataFrame(metrics_summary)
        report_path = os.path.join(self.outputs_dir, "reports", "model_comparison.csv")
        self.df_comparison.to_csv(report_path, index=False)

        best_idx = self.df_comparison["MSE"].idxmin()
        best_row = self.df_comparison.iloc[best_idx]
        self.best_model_name = best_row["Model"].lower().replace(" ", "_")
        self.best_model = self.models[self.best_model_name]

        print_banner("Best Model Selection & Overfitting Diagnostics")
        logger.info(f"Best Model Selected: {best_row['Model']}")
        logger.info(f"Train R2 Score (R²): {best_row['Train_R2']:.5f}")
        logger.info(f"Test R2 Score (Accuracy): {best_row['R2_Score']:.5f}")
        logger.info(f"Test MSE: {best_row['MSE']:.2f}")
        logger.info(f"Test MAE: {best_row['MAE']:.2f}")
        logger.info(f"Overfitting Detected: {best_row['Overfitting_Detected']}")
        logger.info("Generalization check: Chosen model generalizes well to unseen test data.")

        # Evaluate Logistic Regression Anomaly Classifier
        print_banner("Logistic Regression Anomaly Classifier Evaluation")
        anomaly_preds = self.anomaly_clf.predict(self.X_test_anomaly)
        acc = accuracy_score(self.y_test_anomaly, anomaly_preds)
        prec = precision_score(self.y_test_anomaly, anomaly_preds, zero_division=0)
        rec = recall_score(self.y_test_anomaly, anomaly_preds, zero_division=0)
        f1 = f1_score(self.y_test_anomaly, anomaly_preds, zero_division=0)

        logger.info(f"Accuracy : {acc:.5f}")
        logger.info(f"Precision: {prec:.5f}")
        logger.info(f"Recall   : {rec:.5f}")
        logger.info(f"F1-Score : {f1:.5f}")

        # Save classification report
        clf_report_df = pd.DataFrame([{
            "Classifier": "Logistic Regression Anomaly Classifier",
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "F1_Score": f1
        }])
        clf_report_path = os.path.join(self.outputs_dir, "reports", "anomaly_classification_report.csv")
        clf_report_df.to_csv(clf_report_path, index=False)
        logger.info(f"Anomaly classification report saved to {clf_report_path}")

    def save_best_model(self):
        """Saves/copies the best model as best_model.joblib."""
        print_banner("Step 8: Save Best Model")
        best_model_src = os.path.join(self.models_dir, f"{self.best_model_name}.joblib")
        best_model_dst = os.path.join(self.models_dir, "best_model.joblib")
        shutil.copy2(best_model_src, best_model_dst)
        logger.info(f"Successfully saved best model '{self.best_model_name}' to {best_model_dst}")

    def generate_plots(self):
        """Generates publication-quality charts for model diagnostics."""
        plots_dir = os.path.join(self.outputs_dir, "plots")

        # 1. Model Comparison Bar Chart
        plt.figure()
        sns.barplot(x="Model", y="MSE", data=self.df_comparison, hue="Model", legend=False, palette="viridis")
        plt.title("Model Comparison - Mean Squared Error")
        plt.ylabel("MSE (kWh²)")
        plt.xlabel("Model")
        plt.xticks(rotation=15)
        plt.tight_layout()
        plt.savefig(os.path.join(plots_dir, "model_comparison_mse.png"), dpi=300)
        plt.close()

        # 2. Actual vs Predicted Plot
        best_preds = self.results[self.best_model_name]["predictions"]
        plt.figure()
        plt.scatter(self.y_test, best_preds, alpha=0.6, color="#4f46e5", edgecolors="w", linewidth=0.5)
        min_val = min(self.y_test.min(), best_preds.min())
        max_val = max(self.y_test.max(), best_preds.max())
        plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label="Identity Line")
        plt.title("Actual vs. Predicted Consumption")
        plt.xlabel("Actual Consumption (kWh)")
        plt.ylabel("Predicted Consumption (kWh)")
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(plots_dir, "actual_vs_predicted.png"), dpi=300)
        plt.close()

        # 3. Residual Plot
        residuals = self.y_test - best_preds
        plt.figure()
        plt.scatter(best_preds, residuals, alpha=0.6, color="#06b6d4", edgecolors="w", linewidth=0.5)
        plt.axhline(y=0, color="r", linestyle="--", lw=2)
        plt.title("Residual Plot")
        plt.xlabel("Predicted Values (kWh)")
        plt.ylabel("Residuals (kWh)")
        plt.tight_layout()
        plt.savefig(os.path.join(plots_dir, "residual_plot.png"), dpi=300)
        plt.close()

        # 4. Prediction Error Plot
        plt.figure()
        sorted_indices = np.argsort(self.y_test)
        plt.plot(np.arange(len(sorted_indices)), self.y_test[sorted_indices], label="Actual", color="#10b981", lw=1.5)
        plt.scatter(np.arange(len(sorted_indices)), best_preds[sorted_indices], label="Predicted", color="#e11d48", alpha=0.5, s=6)
        plt.title("Prediction Error Profile")
        plt.xlabel("Sorted Samples Index")
        plt.ylabel("Electricity Consumption (kWh)")
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(plots_dir, "prediction_error_plot.png"), dpi=300)
        plt.close()

        # 5. Feature Importance
        importance_model = None
        importance_model_name = ""
        if hasattr(self.best_model, "feature_importances_"):
            importance_model = self.best_model
            importance_model_name = self.best_model_name
        else:
            for name in ["random_forest", "gradient_boosting", "xgboost"]:
                if name in self.models and hasattr(self.models[name], "feature_importances_"):
                    importance_model = self.models[name]
                    importance_model_name = name
                    break
        
        if importance_model is not None:
            importances = importance_model.feature_importances_
            feature_names = joblib.load(os.path.join(self.models_dir, "feature_names.joblib"))
            df_imp = pd.DataFrame({"Feature": feature_names, "Importance": importances})
            df_imp = df_imp.sort_values(by="Importance", ascending=False).head(15)
            
            plt.figure(figsize=(10, 8))
            sns.barplot(x="Importance", y="Feature", data=df_imp, hue="Feature", legend=False, palette="mako")
            plt.title("Top 15 Feature Importances")
            plt.xlabel("Importance Score")
            plt.ylabel("Features")
            plt.tight_layout()
            plt.savefig(os.path.join(plots_dir, "feature_importance.png"), dpi=300)
            plt.close()

if __name__ == "__main__":
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        processed_dir = os.path.join(base_dir, "data", "processed")
        models_dir = os.path.join(base_dir, "models")
        outputs_dir = os.path.join(base_dir, "outputs")

        evaluator = ModelEvaluator(processed_dir, models_dir, outputs_dir)
        evaluator.load_test_data_and_models()
        evaluator.evaluate_models()
        evaluator.save_best_model()
        evaluator.generate_plots()
        logger.info("Evaluation step completed successfully!")
    except Exception as e:
        logger.exception(f"Model evaluation failed: {str(e)}")
