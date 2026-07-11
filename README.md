# 🌿 Smart Campus Energy Analytics

A state-of-the-art intelligent dashboard and predictive analytics platform for campus energy management.

This project bridges the gap between raw institutional data and actionable sustainability metrics, providing real-time forecasting, anomaly detection, and granular visibility into energy consumption.

---

## 📊 Dataset Description

The models in this repository are trained on a robust dataset: **A simulated operational dataset generated based on real-world campus infrastructure, occupancy patterns, laboratory usage, hostel energy demand, cafeteria usage, weather conditions, and solar energy generation.**

This dataset is specifically designed for developing and validating predictive machine learning models, ensuring that our analytics reflect the complex, multi-variable realities of modern institutional energy grids.

---

## ✨ Features

- **Predictive Energy Modeling (Net Grid Usage)**
  Machine Learning models (Linear Regression, Random Forest, XGBoost) accurately forecast the net energy demand on the public grid based on 15+ environmental and occupancy variables.

- **Automated Anomaly Detection**
  Leveraging Isolation Forest unsupervised learning, the platform automatically flags hours of unusual or wasteful energy consumption across the campus, isolating systemic inefficiencies.

- **Comprehensive Sustainability KPIs**
  Track your carbon footprint, solar offset percentages, and total grid load in real time via beautifully designed KPI cards.

- **Time-of-Day Demand Heatmaps**
  Visually spot peak consumption patterns across the week using a dynamic, interactive heatmap.

- **Campus Zone Energy Breakdown**
  A live doughnut chart breaks down energy consumption into precise categories (Boys Hostels, Girls Hostels, Academic & Admin blocks) to target conservation efforts.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Chart.js, Lucide Icons
- **Backend:** Python, FastAPI, Uvicorn
- **Machine Learning:** Scikit-Learn, XGBoost, Pandas
- **Database:** SQLite

---

## 🚀 Getting Started

### 1. Backend & Machine Learning Setup
Ensure you have Python 3.10+ installed.

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server (it will automatically generate the DB and train ML models on first boot)
python server.py
```
*The API will be available at `http://127.0.0.1:5000`*

### 2. Frontend Setup
In a new terminal window, ensure you have Node.js installed.

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The Dashboard will be available at `http://localhost:5173`*

---

## 📈 Machine Learning Pipeline

The project features a complete, modular ML pipeline under `/SmartCampusML`:

1. **`create_database.py`**: Generates the complex simulated operational dataset and applies Anomaly Detection logic using an Isolation Forest.
2. **`preprocessing.py`**: Handles date-time extraction, categorical encoding, and NaN validation.
3. **`feature_engineering.py`**: Computes aggregated features (Total Students, Active Labs, Total Hostel Load).
4. **`train_models.py`**: Evaluates Linear Regression, Decision Trees, Random Forests, and XGBoost to predict the `Net_Grid_Usage_kWh` target variable.
5. **`evaluate_models.py`**: Validates model performance (R², MSE, MAE), checks for overfitting, and saves the most optimal generalized model to disk for production inference.

---

> *"Empowering institutions to build a greener tomorrow through data-driven decisions today."*
