import os
import sqlite3
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib
from utils import setup_logging, init_directories, print_banner

# Initialize logging and directories
logger = setup_logging()
init_directories()

class DataPreprocessor:
    def __init__(self, raw_file_path):
        self.raw_file_path = raw_file_path
        self.df = None
        self.label_encoder = LabelEncoder()
        
    def load_data(self):
        """Loads dataset from SQLite database or raw Excel file and displays initial analysis."""
        print_banner("Step 1: Load Dataset")
        logger.info(f"Loading raw dataset from {self.raw_file_path}...")
        
        if not os.path.exists(self.raw_file_path):
            raise FileNotFoundError(f"Raw data file not found at {self.raw_file_path}")
        
        if self.raw_file_path.endswith(".db"):
            # Load from SQLite database
            conn = sqlite3.connect(self.raw_file_path)
            self.df = pd.read_sql_query("SELECT * FROM campus_data", conn)
            conn.close()
            # Drop auto-increment id column if present
            if "id" in self.df.columns:
                self.df.drop(columns=["id"], inplace=True)
            logger.info(f"Loaded {len(self.df)} rows from SQLite database.")
        else:
            self.df = pd.read_excel(self.raw_file_path, sheet_name="June_2026")
        
        # Display dataset dimensions
        rows, cols = self.df.shape
        logger.info(f"Dataset Shape: {self.df.shape}")
        logger.info(f"Number of Rows: {rows}")
        logger.info(f"Number of Columns: {cols}")
        
        # Display dataset info & data types
        logger.info("Dataset Data Types:")
        for col, dtype in self.df.dtypes.items():
            logger.info(f" - {col}: {dtype}")
            
        logger.info("\nFirst 5 Records:")
        logger.info("\n" + self.df.head().to_string())
        
    def preprocess(self):
        """Performs data cleaning, parsing, encoding, and types validation."""
        print_banner("Step 2: Data Preprocessing")
        if self.df is None:
            raise ValueError("Data must be loaded before preprocessing.")
            
        # Check missing values
        missing_vals = self.df.isnull().sum()
        logger.info("Checking for missing values:")
        for col, count in missing_vals.items():
            if count > 0:
                logger.info(f" - {col}: {count} missing values")
        if missing_vals.sum() == 0:
            logger.info(" - No missing values detected.")
            
        # Check duplicates
        dup_count = self.df.duplicated().sum()
        logger.info(f"Checking for duplicate records: {dup_count} duplicates found.")
        if dup_count > 0:
            self.df.drop_duplicates(inplace=True)
            logger.info(" - Removed duplicate records.")
            
        # Check and handle invalid values (e.g., negative student occupancies)
        logger.info("Checking for invalid values (e.g., negative student occupancies)...")
        student_cols = [c for c in self.df.columns if "Students" in c or "Occupancy" in c or "Staff" in c]
        for col in student_cols:
            neg_mask = self.df[col] < 0
            neg_count = neg_mask.sum()
            if neg_count > 0:
                logger.info(f" - Found {neg_count} negative entries in '{col}'. Clipping negative values to 0.")
                self.df.loc[neg_mask, col] = 0

        # Convert Date to Year, Month, Day
        logger.info("Converting 'Date' to 'Year', 'Month', 'Day'...")
        date_series = pd.to_datetime(self.df["Date"])
        self.df["Year"] = date_series.dt.year
        self.df["Month"] = date_series.dt.month
        self.df["Day_Of_Month"] = date_series.dt.day
        
        # Convert Time to Hour
        logger.info("Extracting 'Hour' from 'Time'...")
        self.df["Hour"] = pd.to_datetime(self.df["Time"], format="%H:%M").dt.hour
        
        # Encode 'Day' column
        logger.info("Encoding 'Day' column using LabelEncoder...")
        self.df["Day_Encoded"] = self.label_encoder.fit_transform(self.df["Day"])
        
        # Save LabelEncoder
        le_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "label_encoder.joblib")
        joblib.dump(self.label_encoder, le_path)
        logger.info(f"LabelEncoder saved to {le_path}")
        
        # Validate data types
        non_numeric_cols = self.df.select_dtypes(exclude=['number']).columns.tolist()
        logger.info(f"Non-numeric columns in processed dataset: {non_numeric_cols}")
        
        return self.df

    def save_preprocessed(self, output_path):
        """Saves the preprocessed dataset to a CSV file."""
        if self.df is None:
            raise ValueError("No data to save.")
        self.df.to_csv(output_path, index=False)
        logger.info(f"Preprocessed data saved to {output_path}")

if __name__ == "__main__":
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        # Use SQLite database as primary data source
        raw_path = os.path.join(base_dir, "data", "smart_campus.db")
        if not os.path.exists(raw_path):
            # Fall back to Excel if database not yet created
            raw_path = os.path.join(base_dir, "data", "raw", "June_2026_Smart_Campus_Electricity_Dataset.xlsx")
        output_path = os.path.join(base_dir, "data", "processed", "preprocessed_data.csv")
        
        preprocessor = DataPreprocessor(raw_path)
        preprocessor.load_data()
        preprocessor.preprocess()
        preprocessor.save_preprocessed(output_path)
        logger.info("Preprocessing step completed successfully!")
    except Exception as e:
        logger.exception(f"Preprocessing failed: {str(e)}")
