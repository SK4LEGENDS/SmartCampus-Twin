import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
import joblib

def load_prediction_artifacts():
    """Loads model, encoder, and feature names."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")

    best_model_path = os.path.join(models_dir, "best_model.joblib")
    encoder_path = os.path.join(models_dir, "label_encoder.joblib")
    features_path = os.path.join(models_dir, "feature_names.joblib")

    if not os.path.exists(best_model_path):
        raise FileNotFoundError(f"Model file not found at {best_model_path}. Run evaluate_models.py first.")
    if not os.path.exists(encoder_path):
        raise FileNotFoundError(f"Label encoder not found at {encoder_path}. Run preprocessing.py first.")
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"Feature names file not found at {features_path}. Run train_models.py first.")

    model = joblib.load(best_model_path)
    label_encoder = joblib.load(encoder_path)
    feature_names = joblib.load(features_path)

    return model, label_encoder, feature_names

def parse_input_and_predict(inputs_dict):
    """Processes dictionary inputs, performs feature engineering, and makes a prediction."""
    model, label_encoder, feature_names = load_prediction_artifacts()

    # Create base DataFrame
    df = pd.DataFrame([inputs_dict])

    # 1. Parse Date and Time Features
    date_str = inputs_dict.get("Date", datetime.now().strftime("%Y-%m-%d"))
    time_str = inputs_dict.get("Time", datetime.now().strftime("%H:%M"))
    day_str = inputs_dict.get("Day", datetime.now().strftime("%A"))

    date_series = pd.to_datetime(date_str)
    df["Year"] = date_series.year
    df["Month"] = date_series.month
    df["Day_Of_Month"] = date_series.day
    df["Hour"] = pd.to_datetime(time_str, format="%H:%M").hour

    # Encode Day using loaded encoder
    try:
        df["Day_Encoded"] = label_encoder.transform([day_str])[0]
    except ValueError:
        df["Day_Encoded"] = 0

    # 2. Feature Engineering
    ab_cols = ["AB1_Students", "AB2_Students", "AB3_Students", "AB4_Students", "AB5_Students"]
    mab_cols = ["MAB1_Students", "MAB2_Students", "MAB3_Students", "MAB4_Students"]

    df["Total_AB_Students"] = df[ab_cols].sum(axis=1)
    df["Total_MAB_Students"] = df[mab_cols].sum(axis=1)
    df["Total_Students"] = df["Total_AB_Students"] + df["Total_MAB_Students"]
    df["Total_Hostel_Load"] = df["Boys_Hostel_Load_kWh"] + df["Girls_Hostel_Load_kWh"]
    df["Total_Active_Labs"] = df["Active_Windows_Labs"] + df["Active_Mac_Labs"]

    # Align columns in exactly the same order as model training
    X = df[feature_names]

    # Predict
    pred = model.predict(X)[0]
    return pred

def predict_anomaly(inputs_dict):
    """Processes dictionary inputs, performs feature engineering, and predicts anomaly state using Logistic Regression."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")

    clf_path = os.path.join(models_dir, "anomaly_classifier.joblib")
    encoder_path = os.path.join(models_dir, "label_encoder.joblib")
    features_path = os.path.join(models_dir, "feature_names.joblib")

    if not os.path.exists(clf_path):
        raise FileNotFoundError(f"Anomaly classifier model not found at {clf_path}. Run train_models.py first.")
    if not os.path.exists(encoder_path):
        raise FileNotFoundError(f"Label encoder not found at {encoder_path}. Run preprocessing.py first.")
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"Feature names file not found at {features_path}. Run train_models.py first.")

    clf = joblib.load(clf_path)
    label_encoder = joblib.load(encoder_path)
    feature_names = joblib.load(features_path)

    # Create base DataFrame
    df = pd.DataFrame([inputs_dict])

    # 1. Parse Date and Time Features
    date_str = inputs_dict.get("Date", datetime.now().strftime("%Y-%m-%d"))
    time_str = inputs_dict.get("Time", datetime.now().strftime("%H:%M"))
    day_str = inputs_dict.get("Day", datetime.now().strftime("%A"))

    date_series = pd.to_datetime(date_str)
    df["Year"] = date_series.year
    df["Month"] = date_series.month
    df["Day_Of_Month"] = date_series.day
    df["Hour"] = pd.to_datetime(time_str, format="%H:%M").hour

    # Encode Day using loaded encoder
    try:
        df["Day_Encoded"] = label_encoder.transform([day_str])[0]
    except ValueError:
        df["Day_Encoded"] = 0

    # 2. Feature Engineering
    ab_cols = ["AB1_Students", "AB2_Students", "AB3_Students", "AB4_Students", "AB5_Students"]
    mab_cols = ["MAB1_Students", "MAB2_Students", "MAB3_Students", "MAB4_Students"]

    df["Total_AB_Students"] = df[ab_cols].sum(axis=1)
    df["Total_MAB_Students"] = df[mab_cols].sum(axis=1)
    df["Total_Students"] = df["Total_AB_Students"] + df["Total_MAB_Students"]
    df["Total_Hostel_Load"] = df["Boys_Hostel_Load_kWh"] + df["Girls_Hostel_Load_kWh"]
    df["Total_Active_Labs"] = df["Active_Windows_Labs"] + df["Active_Mac_Labs"]

    # Align columns in exactly the same order as model training
    X = df[feature_names]

    # Predict
    pred = clf.predict(X)[0]
    return int(pred)

def get_interactive_inputs():
    """Gathers user input from command line interactively."""
    print("=" * 60)
    print(" SMART CAMPUS ELECTRICITY PREDICTION SYSTEM ")
    print("=" * 60)
    print("Please enter operational variables below:\n")

    inputs = {}
    questions = [
        ("Temperature_C", "Temperature (°C)", float, 30.0),
        ("Humidity_%", "Humidity (%)", int, 50),
        ("AB1_Students", "AB1 Students count", int, 0),
        ("AB2_Students", "AB2 Students count", int, 0),
        ("AB3_Students", "AB3 Students count", int, 0),
        ("AB4_Students", "AB4 Students count", int, 0),
        ("AB5_Students", "AB5 Students count", int, 0),
        ("MAB1_Students", "MAB1 Students count", int, 0),
        ("MAB2_Students", "MAB2 Students count", int, 0),
        ("MAB3_Students", "MAB3 Students count", int, 0),
        ("MAB4_Students", "MAB4 Students count", int, 0),
        ("Active_Windows_Labs", "Active Windows Labs count", int, 0),
        ("Active_Mac_Labs", "Active Mac Labs count", int, 0),
        ("Central_Library_Occupancy", "Central Library Occupancy", int, 0),
        ("Admin_Office_Staff", "Admin Office Staff count", int, 0),
        ("Glass_Cafeteria_Occupancy", "Glass Cafeteria Occupancy", int, 0),
        ("Open_Cafeteria_Occupancy", "Open Cafeteria Occupancy", int, 0),
        ("Auditorium_Active", "Auditorium Active (1 for Yes, 0 for No)", int, 0),
        ("Boys_Hostel_Load_kWh", "Boys Hostel Load (kWh)", int, 100),
        ("Girls_Hostel_Load_kWh", "Girls Hostel Load (kWh)", int, 100),
        ("Solar_Generation_kWh", "Solar Generation (kWh)", int, 0),
    ]

    for key, label, val_type, default in questions:
        while True:
            user_input = input(f"{label} [default={default}]: ").strip()
            if not user_input:
                inputs[key] = default
                break
            try:
                inputs[key] = val_type(user_input)
                break
            except ValueError:
                print(f"Invalid input. Please enter a valid {val_type.__name__}.")

    inputs["Date"] = input("Date (YYYY-MM-DD) [default=today]: ").strip() or datetime.now().strftime("%Y-%m-%d")
    inputs["Time"] = input("Time (HH:MM) [default=current hour]: ").strip() or datetime.now().strftime("%H:00")
    inputs["Day"] = input("Day of Week (e.g., Monday) [default=today's weekday]: ").strip() or datetime.now().strftime("%A")

    return inputs

if __name__ == "__main__":
    try:
        if len(sys.argv) == 1:
            inputs = get_interactive_inputs()
            prediction = parse_input_and_predict(inputs)
            print("\n" + "=" * 60)
            print(f"PREDICTED ELECTRICITY CONSUMPTION: {prediction:.2f} kWh")
            print("=" * 60)
        else:
            print("Usage: Run without arguments for interactive prediction mode.")
    except Exception as e:
        print(f"Prediction failed: {str(e)}")
        sys.exit(1)
