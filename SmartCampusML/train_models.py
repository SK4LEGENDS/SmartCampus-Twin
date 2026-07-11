import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import joblib
from utils import setup_logging, print_banner

logger = setup_logging()

class ModelTrainer:
    def __init__(self, dataset_path):
        self.dataset_path = dataset_path
        self.df = None
        self.X = None
        self.y = None
        self.X_train, self.X_test = None, None
        self.y_train, self.y_test = None, None
        self.feature_names = []

    def load_and_split_data(self):
        """Loads feature engineered dataset and splits it into train/test sets."""
        print_banner("Step 5: Train Test Split")
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Feature engineered CSV not found at {self.dataset_path}")
            
        self.df = pd.read_csv(self.dataset_path)
        logger.info(f"Loaded dataset from {self.dataset_path}. Total records: {len(self.df)}")

        # Define Target Variable
        target_col = "Net_Grid_Usage_kWh"
        if target_col not in self.df.columns:
            raise KeyError(f"Target column '{target_col}' not found in dataset.")

        # Drop non-numeric identifier columns and the original total electricity (which leaks the answer)
        drop_cols = ["Date", "Day", "Time", target_col, "Electricity_Consumption_kWh"]
        self.X = self.df.drop(columns=drop_cols, errors="ignore")
        self.y = self.df[target_col]
        self.feature_names = self.X.columns.tolist()

        # Split: 80% Training, 20% Testing, random_state=42
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=0.2, random_state=42
        )

        # Save split datasets for model evaluation script
        processed_dir = os.path.dirname(self.dataset_path)
        self.X_train.to_csv(os.path.join(processed_dir, "X_train.csv"), index=False)
        self.X_test.to_csv(os.path.join(processed_dir, "X_test.csv"), index=False)
        self.y_train.to_csv(os.path.join(processed_dir, "y_train.csv"), index=False)
        self.y_test.to_csv(os.path.join(processed_dir, "y_test.csv"), index=False)
        
        # Save feature names list
        feature_names_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "feature_names.joblib")
        joblib.dump(self.feature_names, feature_names_path)
        logger.info(f"Feature names saved to {feature_names_path}")

    def train_models(self):
        """Trains multiple regression models and saves them."""
        print_banner("Step 6: Train Machine Learning Models")
        if self.X_train is None or self.y_train is None:
            raise ValueError("Data must be split before training models.")

        models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
        os.makedirs(models_dir, exist_ok=True)

        # Define candidate models with appropriate hyperparameters
        models = {
            "linear_regression": LinearRegression(),
            "decision_tree": DecisionTreeRegressor(max_depth=10, min_samples_split=5, random_state=42),
            "random_forest": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
            "gradient_boosting": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        }

        # XGBoost Regressor (conditional import)
        try:
            from xgboost import XGBRegressor
            models["xgboost"] = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42, n_jobs=-1)
            logger.info("XGBoost is installed. Added XGBoost Regressor to the training pipeline.")
        except ImportError:
            logger.warning("XGBoost is not installed on this system. Skipping XGBoost Regressor training.")

        # Train and save each model
        for name, model in models.items():
            logger.info(f"Training {name.replace('_', ' ').title()}...")
            model.fit(self.X_train, self.y_train)
            
            # Save model binary
            model_path = os.path.join(models_dir, f"{name}.joblib")
            joblib.dump(model, model_path)

        logger.info("All models trained and saved successfully.")

if __name__ == "__main__":
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(base_dir, "data", "processed", "feature_engineered_dataset.csv")

        trainer = ModelTrainer(dataset_path)
        trainer.load_and_split_data()
        trainer.train_models()
        logger.info("Training step completed successfully!")
    except Exception as e:
        logger.exception(f"Model training failed: {str(e)}")
