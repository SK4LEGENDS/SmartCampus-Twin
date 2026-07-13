import os
import sys
import pandas as pd
import numpy as np
import sqlite3
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime
from sklearn.preprocessing import LabelEncoder

# Add SmartCampusML directory to path for modules loading
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "SmartCampusML"))

app = FastAPI(title="Smart Campus Analytics API")

# Mount static plots generated during model evaluation
plots_path = os.path.join("SmartCampusML", "outputs", "plots")
os.makedirs(plots_path, exist_ok=True)
app.mount("/api/plots", StaticFiles(directory=plots_path), name="plots")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    Temperature_C: float
    Humidity_Percent: float  # Map from frontend Humidity_%
    AB1_Students: int
    AB2_Students: int
    AB3_Students: int
    AB4_Students: int
    AB5_Students: int
    MAB1_Students: int
    MAB2_Students: int
    MAB3_Students: int
    MAB4_Students: int
    Active_Windows_Labs: int
    Active_Mac_Labs: int
    Central_Library_Occupancy: int
    Admin_Office_Staff: int
    Glass_Cafeteria_Occupancy: int
    Open_Cafeteria_Occupancy: int
    Auditorium_Active: int
    Boys_Hostel_Load_kWh: int
    Girls_Hostel_Load_kWh: int
    Solar_Generation_kWh: int
    Date: str = None
    Time: str = None
    Day: str = None

def check_and_run_pipeline():
    """Ensure the models and feature engineered data are generated before starting."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ml_dir = os.path.join(base_dir, "SmartCampusML")
    best_model_path = os.path.join(ml_dir, "models", "best_model.joblib")
    db_path = os.path.join(ml_dir, "data", "smart_campus.db")
    
    # Generate the database if it doesn't exist
    if not os.path.exists(db_path):
        print("[Server] SQLite database not found. Generating...")
        import subprocess
        subprocess.run([sys.executable, "create_database.py"], cwd=ml_dir)
    
    if not os.path.exists(best_model_path):
        print("[Server] Model artifacts not found. Starting pipeline run...")
        import subprocess
        # Run pipeline stages sequentially
        subprocess.run([sys.executable, "preprocessing.py"], cwd=ml_dir)
        subprocess.run([sys.executable, "feature_engineering.py"], cwd=ml_dir)
        subprocess.run([sys.executable, "train_models.py"], cwd=ml_dir)
        subprocess.run([sys.executable, "evaluate_models.py"], cwd=ml_dir)
        print("[Server] Pipeline execution finished.")

# Run pipeline check before server initialization
check_and_run_pipeline()

# Load Dataset from SQLite
db_path = os.path.join("SmartCampusML", "data", "smart_campus.db")
if not os.path.exists(db_path):
    check_and_run_pipeline()

conn = sqlite3.connect(db_path)
df_dataset = pd.read_sql_query("SELECT * FROM campus_data", conn)
conn.close()

# Drop the auto-increment id column from SQLite
if "id" in df_dataset.columns:
    df_dataset.drop(columns=["id"], inplace=True)

# Apply in-memory preprocessing (same as preprocessing.py)
date_series = pd.to_datetime(df_dataset["Date"])
df_dataset["Year"] = date_series.dt.year
df_dataset["Month"] = date_series.dt.month
df_dataset["Day_Of_Month"] = date_series.dt.day
df_dataset["Hour"] = pd.to_datetime(df_dataset["Time"], format="%H:%M").dt.hour

le = LabelEncoder()
df_dataset["Day_Encoded"] = le.fit_transform(df_dataset["Day"])

# Apply in-memory feature engineering (same as feature_engineering.py)
ab_cols = ["AB1_Students", "AB2_Students", "AB3_Students", "AB4_Students", "AB5_Students"]
mab_cols = ["MAB1_Students", "MAB2_Students", "MAB3_Students", "MAB4_Students"]
df_dataset["Total_AB_Students"] = df_dataset[ab_cols].sum(axis=1)
df_dataset["Total_MAB_Students"] = df_dataset[mab_cols].sum(axis=1)
df_dataset["Total_Students"] = df_dataset["Total_AB_Students"] + df_dataset["Total_MAB_Students"]
df_dataset["Total_Hostel_Load"] = df_dataset["Boys_Hostel_Load_kWh"] + df_dataset["Girls_Hostel_Load_kWh"]
df_dataset["Total_Active_Labs"] = df_dataset["Active_Windows_Labs"] + df_dataset["Active_Mac_Labs"]

print(f"[Server] Loaded {len(df_dataset)} records from SQLite database ({db_path})")

@app.get("/api/data")
def get_data():
    """Returns the full cleaned dataset rows."""
    try:
        # Convert NaN values to None for clean JSON response
        data = df_dataset.replace({np.nan: None}).to_dict(orient="records")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
def get_stats():
    """Computes global analytics stats from the dataset."""
    try:
        total_elec = float(df_dataset["Electricity_Consumption_kWh"].sum())
        total_solar = float(df_dataset["Solar_Generation_kWh"].sum())
        total_net_grid = float(df_dataset["Net_Grid_Usage_kWh"].sum())
        peak_elec = float(df_dataset["Electricity_Consumption_kWh"].max())
        avg_temp = float(df_dataset["Temperature_C"].mean())
        solar_offset = (total_solar / total_elec) * 100
        total_anomalies = int(df_dataset["Is_Anomaly"].sum())
        carbon_footprint_tons = (total_net_grid * 0.82) / 1000  # Assume 0.82 kg CO2 per kWh

        return {
            "totalElectricity": total_elec,
            "totalSolar": total_solar,
            "totalNetGrid": total_net_grid,
            "solarOffset": solar_offset,
            "peakDemand": peak_elec,
            "avgTemperature": avg_temp,
            "totalRecords": len(df_dataset),
            "totalAnomalies": total_anomalies,
            "carbonFootprint": carbon_footprint_tons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict(payload: PredictionInput):
    """Processes frontend operational input and returns the predicted electricity load."""
    try:
        from predict import parse_input_and_predict
        
        # Format variables back to expected names in prediction model
        inputs_dict = {
            "Temperature_C": payload.Temperature_C,
            "Humidity_%": payload.Humidity_Percent,  # Correct map to Humidity_%
            "AB1_Students": payload.AB1_Students,
            "AB2_Students": payload.AB2_Students,
            "AB3_Students": payload.AB3_Students,
            "AB4_Students": payload.AB4_Students,
            "AB5_Students": payload.AB5_Students,
            "MAB1_Students": payload.MAB1_Students,
            "MAB2_Students": payload.MAB2_Students,
            "MAB3_Students": payload.MAB3_Students,
            "MAB4_Students": payload.MAB4_Students,
            "Active_Windows_Labs": payload.Active_Windows_Labs,
            "Active_Mac_Labs": payload.Active_Mac_Labs,
            "Central_Library_Occupancy": payload.Central_Library_Occupancy,
            "Admin_Office_Staff": payload.Admin_Office_Staff,
            "Glass_Cafeteria_Occupancy": payload.Glass_Cafeteria_Occupancy,
            "Open_Cafeteria_Occupancy": payload.Open_Cafeteria_Occupancy,
            "Auditorium_Active": payload.Auditorium_Active,
            "Boys_Hostel_Load_kWh": payload.Boys_Hostel_Load_kWh,
            "Girls_Hostel_Load_kWh": payload.Girls_Hostel_Load_kWh,
            "Solar_Generation_kWh": payload.Solar_Generation_kWh,
            "Date": payload.Date or datetime.now().strftime("%Y-%m-%d"),
            "Time": payload.Time or datetime.now().strftime("%H:%M"),
            "Day": payload.Day or datetime.now().strftime("%A"),
        }

        prediction = parse_input_and_predict(inputs_dict)
        return {"prediction": float(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/predict_anomaly")
def predict_anomaly_endpoint(payload: PredictionInput):
    """Processes frontend operational input and returns the predicted anomaly state (0 or 1)."""
    try:
        from predict import predict_anomaly
        
        # Format variables back to expected names in prediction model
        inputs_dict = {
            "Temperature_C": payload.Temperature_C,
            "Humidity_%": payload.Humidity_Percent,  # Correct map to Humidity_%
            "AB1_Students": payload.AB1_Students,
            "AB2_Students": payload.AB2_Students,
            "AB3_Students": payload.AB3_Students,
            "AB4_Students": payload.AB4_Students,
            "AB5_Students": payload.AB5_Students,
            "MAB1_Students": payload.MAB1_Students,
            "MAB2_Students": payload.MAB2_Students,
            "MAB3_Students": payload.MAB3_Students,
            "MAB4_Students": payload.MAB4_Students,
            "Active_Windows_Labs": payload.Active_Windows_Labs,
            "Active_Mac_Labs": payload.Active_Mac_Labs,
            "Central_Library_Occupancy": payload.Central_Library_Occupancy,
            "Admin_Office_Staff": payload.Admin_Office_Staff,
            "Glass_Cafeteria_Occupancy": payload.Glass_Cafeteria_Occupancy,
            "Open_Cafeteria_Occupancy": payload.Open_Cafeteria_Occupancy,
            "Auditorium_Active": payload.Auditorium_Active,
            "Boys_Hostel_Load_kWh": payload.Boys_Hostel_Load_kWh,
            "Girls_Hostel_Load_kWh": payload.Girls_Hostel_Load_kWh,
            "Solar_Generation_kWh": payload.Solar_Generation_kWh,
            "Date": payload.Date or datetime.now().strftime("%Y-%m-%d"),
            "Time": payload.Time or datetime.now().strftime("%H:%M"),
            "Day": payload.Day or datetime.now().strftime("%A"),
        }

        is_anomaly = predict_anomaly(inputs_dict)
        return {"is_anomaly": int(is_anomaly)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly classification error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=5000, reload=True)
