"""
Smart Campus SQLite Database Generator
=======================================
Generates a simulated operational dataset from January 2026 to June 2026
based on real-world campus infrastructure, occupancy patterns, laboratory usage,
hostel energy demand, cafeteria usage, weather conditions, and solar energy generation.

This script populates a SQLite database with hourly records (24h x 181 days = 4344 rows)
matching the exact schema used by the SmartCampus ML pipeline and React dashboard.
"""

import os
import sqlite3
import random
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

# ─────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "smart_campus.db")

START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 6, 30)

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Day-name to label-encoded value (same as LabelEncoder alphabetical order)
DAY_ENCODING = {
    "Friday": 0, "Monday": 1, "Saturday": 2, "Sunday": 3,
    "Thursday": 4, "Tuesday": 5, "Wednesday": 6
}

# ─────────────────────────────────────────────────────────────
# Monthly climate profiles (Vellore, India approximate)
# ─────────────────────────────────────────────────────────────
# Format: (month_index_1based, base_temp_day, temp_range, base_humidity, humidity_range)
CLIMATE = {
    1: {"temp_day": 28.0, "temp_night": 19.0, "humidity_base": 55, "humidity_range": 12},  # January - mild winter
    2: {"temp_day": 30.0, "temp_night": 20.5, "humidity_base": 50, "humidity_range": 10},  # February - warming
    3: {"temp_day": 33.0, "temp_night": 23.0, "humidity_base": 48, "humidity_range": 10},  # March - hot & dry
    4: {"temp_day": 35.5, "temp_night": 25.5, "humidity_base": 52, "humidity_range": 12},  # April - peak summer
    5: {"temp_day": 37.0, "temp_night": 27.0, "humidity_base": 55, "humidity_range": 14},  # May - hottest
    6: {"temp_day": 34.0, "temp_night": 26.0, "humidity_base": 68, "humidity_range": 14},  # June - pre-monsoon
}


def get_temperature(month, hour, day_of_month):
    """Generate realistic temperature with diurnal cycle and seasonal variation."""
    c = CLIMATE[month]
    # Diurnal cycle: coldest at 04:00, hottest at 14:00
    diurnal = math.sin(math.pi * (hour - 4) / 20) if 4 <= hour <= 24 else math.sin(math.pi * (hour + 20) / 20)
    diurnal = max(-1, min(1, diurnal))
    
    base = c["temp_night"] + (c["temp_day"] - c["temp_night"]) * (diurnal + 1) / 2
    # Add small daily variation
    daily_offset = math.sin(2 * math.pi * day_of_month / 30) * 1.5
    noise = np.random.normal(0, 0.6)
    
    return round(max(16.0, min(42.0, base + daily_offset + noise)), 1)


def get_humidity(month, hour, temperature):
    """Generate humidity inversely correlated with temperature."""
    c = CLIMATE[month]
    # Higher humidity at night, lower in afternoon heat
    hour_factor = 1.0 - 0.3 * math.sin(math.pi * (hour - 4) / 20) if 4 <= hour <= 24 else 1.0
    base = c["humidity_base"] * hour_factor
    noise = np.random.normal(0, 3)
    # Inverse correlation with temp
    temp_offset = -(temperature - 30) * 0.8
    
    return int(max(38, min(88, base + temp_offset + noise)))


def is_weekend(day_name):
    return day_name in ("Saturday", "Sunday")


def is_exam_period(month, day_of_month):
    """Exam periods: mid-month in March and May."""
    if month == 3 and 10 <= day_of_month <= 20:
        return True
    if month == 5 and 5 <= day_of_month <= 15:
        return True
    return False


def is_vacation(month, day_of_month):
    """Winter break first 2 weeks of Jan, summer break late May."""
    if month == 1 and day_of_month <= 10:
        return True
    return False


def get_student_count(month, hour, day_name, day_of_month, block_type="ab", block_index=0):
    """
    Generate student count for an academic block at a given hour.
    block_type: 'ab' (academic) or 'mab' (M-block)
    """
    # Base capacity differs by block type
    if block_type == "ab":
        max_capacity = [1800, 1700, 1650, 1550, 1700][block_index]
    else:
        max_capacity = [1400, 1400, 1400, 1500][block_index]
    
    # Night hours: near zero
    if hour < 6 or hour >= 22:
        base = random.randint(0, 40)
        return max(0, base)
    
    # Vacation: minimal presence
    if is_vacation(month, day_of_month):
        return random.randint(0, 30)
    
    # Weekend: reduced capacity
    weekend_mult = 0.15 if is_weekend(day_name) else 1.0
    
    # Exam period: higher occupancy
    exam_mult = 1.2 if is_exam_period(month, day_of_month) else 1.0
    
    # Time-of-day pattern: peaks during class hours
    if 8 <= hour <= 11:
        time_factor = 0.7 + (hour - 8) * 0.075  # Ramp up morning
    elif 12 <= hour <= 13:
        time_factor = 0.45  # Lunch dip
    elif 14 <= hour <= 16:
        time_factor = 0.75  # Afternoon classes
    elif 17 <= hour <= 19:
        time_factor = 0.35  # Evening wind-down
    elif 6 <= hour < 8:
        time_factor = 0.1 + (hour - 6) * 0.15  # Early morning ramp
    elif 20 <= hour < 22:
        time_factor = 0.1  # Late evening
    else:
        time_factor = 0.05
    
    count = max_capacity * time_factor * weekend_mult * exam_mult
    noise = np.random.normal(0, count * 0.12)
    
    return max(0, int(count + noise))


def get_lab_count(hour, day_name, month, day_of_month):
    """Active labs count (Windows or Mac), peak 0–57."""
    if is_vacation(month, day_of_month):
        return 0
    if is_weekend(day_name):
        if 10 <= hour <= 16:
            return random.randint(0, 8)
        return 0
    if hour < 8 or hour >= 20:
        return 0
    
    # Peak during 09:00–17:00
    if 9 <= hour <= 17:
        base = 25 + 15 * math.sin(math.pi * (hour - 9) / 8)
        noise = np.random.normal(0, 6)
        return max(0, min(57, int(base + noise)))
    elif 8 <= hour < 9:
        return random.randint(2, 15)
    else:  # 17 < hour < 20
        return random.randint(0, 12)


def get_library_occupancy(hour, day_name, month, day_of_month):
    """Central Library Occupancy, range 0–475."""
    if is_vacation(month, day_of_month):
        return random.randint(0, 20)
    
    weekend_mult = 0.5 if is_weekend(day_name) else 1.0
    exam_mult = 1.4 if is_exam_period(month, day_of_month) else 1.0
    
    if hour < 7 or hour >= 22:
        return random.randint(0, 15)
    
    # Library peaks 10:00–20:00
    if 10 <= hour <= 20:
        peak_factor = 1.0 - abs(hour - 15) * 0.06  # Peak around 15:00
        base = 350 * peak_factor * weekend_mult * exam_mult
        noise = np.random.normal(0, 30)
        return max(0, min(475, int(base + noise)))
    elif 7 <= hour < 10:
        return int(40 + (hour - 7) * 40 * weekend_mult)
    else:
        return random.randint(20, 80)


def get_admin_staff(hour, day_name, month, day_of_month):
    """Admin office staff, 5 off-hours, ~180 during 09:00–17:00 weekdays."""
    if is_weekend(day_name) or is_vacation(month, day_of_month):
        return 5
    if 9 <= hour <= 17:
        return 180
    return 5


def get_cafeteria_occupancy(hour, day_name, month, day_of_month, caf_type="glass"):
    """Cafeteria occupancy with meal-time peaks."""
    if is_vacation(month, day_of_month):
        if caf_type == "glass":
            return random.randint(10, 30)
        return random.randint(5, 15)
    
    weekend_mult = 0.6 if is_weekend(day_name) else 1.0
    
    if caf_type == "glass":
        max_cap = 450
        base_idle = 20
    else:
        max_cap = 180
        base_idle = 10
    
    # Meal peaks
    if 7 <= hour <= 9:  # Breakfast
        factor = 0.35
    elif 12 <= hour <= 13:  # Lunch peak
        factor = 0.85
    elif 18 <= hour <= 20:  # Dinner
        factor = 0.6
    elif 15 <= hour <= 17:  # Tea/snack
        factor = 0.3
    elif 10 <= hour <= 11:
        factor = 0.15
    elif 14 <= hour <= 14:
        factor = 0.2
    else:
        return base_idle
    
    count = max_cap * factor * weekend_mult
    noise = np.random.normal(0, count * 0.1)
    return max(base_idle, min(max_cap, int(count + noise)))


def get_auditorium_active(hour, day_name, month, day_of_month):
    """Auditorium: binary, ~2-3% probability during 09:00–18:00 weekdays."""
    if is_weekend(day_name) or is_vacation(month, day_of_month):
        return 0
    if 9 <= hour <= 18:
        return 1 if random.random() < 0.025 else 0
    return 0


def get_hostel_load(hour, month, hostel_type="boys"):
    """
    Hostel load in kWh. Higher at night (AC/fans), lower during day when students are in class.
    Boys: 188–720, Girls: 168–690
    """
    if hostel_type == "boys":
        base_min, base_max = 188, 720
    else:
        base_min, base_max = 168, 690
    
    # Seasonal: higher in summer months (more AC usage)
    seasonal_factor = {1: 0.65, 2: 0.70, 3: 0.80, 4: 0.90, 5: 0.95, 6: 1.0}[month]
    
    # Time of day: higher at night when students are in rooms
    if 0 <= hour <= 6:
        time_factor = 0.8  # Night — moderate (sleeping)
    elif 7 <= hour <= 8:
        time_factor = 0.6  # Morning rush
    elif 9 <= hour <= 16:
        time_factor = 0.4  # Daytime — students in class
    elif 17 <= hour <= 20:
        time_factor = 0.7  # Evening return
    elif 21 <= hour <= 23:
        time_factor = 0.9  # Night peak
    else:
        time_factor = 0.5
    
    load_range = base_max - base_min
    load = base_min + load_range * time_factor * seasonal_factor
    noise = np.random.normal(0, load * 0.06)
    
    return max(base_min, min(base_max, int(load + noise)))


def get_solar_generation(hour, month, day_of_month):
    """
    Solar generation in kWh. 0 at night, bell curve during day peaking at noon.
    Higher in summer months. Range 0–450.
    """
    # Night: no solar
    if hour < 6 or hour >= 19:
        return 0
    
    # Seasonal factor: Jan has shorter/weaker sun, Jun has stronger
    seasonal = {1: 0.55, 2: 0.65, 3: 0.80, 4: 0.90, 5: 0.95, 6: 1.0}[month]
    
    # Bell curve peaking at noon (hour 12)
    solar_peak = 450 * seasonal
    hour_factor = math.exp(-0.5 * ((hour - 12.5) / 2.8) ** 2)
    
    # Cloud cover randomness
    cloud_factor = random.uniform(0.7, 1.0)
    
    generation = solar_peak * hour_factor * cloud_factor
    noise = np.random.normal(0, generation * 0.05)
    
    return max(0, min(450, int(generation + noise)))


def compute_electricity_consumption(row):
    """
    Compute total campus electricity consumption based on all operational drivers.
    This models the real relationship the ML model learns.
    """
    # Base infrastructure load (lighting, HVAC, servers, water pumps, etc.)
    base_load = 1650
    
    # Student occupancy contribution (~0.15 kWh per student on campus)
    total_students = (row["AB1_Students"] + row["AB2_Students"] + row["AB3_Students"] +
                      row["AB4_Students"] + row["AB5_Students"] + row["MAB1_Students"] +
                      row["MAB2_Students"] + row["MAB3_Students"] + row["MAB4_Students"])
    student_load = total_students * 0.15
    
    # Lab load (~18 kWh per active lab)
    lab_load = (row["Active_Windows_Labs"] + row["Active_Mac_Labs"]) * 18
    
    # Library load
    library_load = row["Central_Library_Occupancy"] * 0.12
    
    # Cafeteria load
    cafe_load = (row["Glass_Cafeteria_Occupancy"] * 0.3 + row["Open_Cafeteria_Occupancy"] * 0.15)
    
    # Admin offices
    admin_load = row["Admin_Office_Staff"] * 0.5
    
    # Auditorium
    auditorium_load = row["Auditorium_Active"] * 250
    
    # Hostel loads (already in kWh)
    hostel_load = row["Boys_Hostel_Load_kWh"] + row["Girls_Hostel_Load_kWh"]
    
    # Temperature-driven HVAC (above 28°C increases cooling demand)
    temp = row["Temperature_C"]
    hvac_load = max(0, (temp - 28) * 35) if temp > 28 else 0
    
    # Solar offset (reduces net consumption)
    solar_offset = row["Solar_Generation_kWh"] * 0.85  # 85% efficiency
    
    total = (base_load + student_load + lab_load + library_load +
             cafe_load + admin_load + auditorium_load + hostel_load + 
             hvac_load - solar_offset)
    
    # Add realistic noise
    noise = np.random.normal(0, total * 0.025)
    
    return round(max(1500, total + noise), 1)


def generate_dataset():
    """Generate the full 6-month hourly dataset."""
    print("=" * 60)
    print("  SMART CAMPUS DATABASE GENERATOR")
    print("  Generating Jan 2026 – Jun 2026 simulated operational data")
    print("=" * 60)
    
    rows = []
    current_date = START_DATE
    
    while current_date <= END_DATE:
        date_str = current_date.strftime("%Y-%m-%d")
        day_name = current_date.strftime("%A")
        month = current_date.month
        day_of_month = current_date.day
        
        for hour in range(24):
            time_str = f"{hour:02d}:00"
            
            temp = get_temperature(month, hour, day_of_month)
            humidity = get_humidity(month, hour, temp)
            
            row = {
                "Date": date_str,
                "Day": day_name,
                "Time": time_str,
                "Temperature_C": temp,
                "Humidity_%": humidity,
                "AB1_Students": get_student_count(month, hour, day_name, day_of_month, "ab", 0),
                "AB2_Students": get_student_count(month, hour, day_name, day_of_month, "ab", 1),
                "AB3_Students": get_student_count(month, hour, day_name, day_of_month, "ab", 2),
                "AB4_Students": get_student_count(month, hour, day_name, day_of_month, "ab", 3),
                "AB5_Students": get_student_count(month, hour, day_name, day_of_month, "ab", 4),
                "MAB1_Students": get_student_count(month, hour, day_name, day_of_month, "mab", 0),
                "MAB2_Students": get_student_count(month, hour, day_name, day_of_month, "mab", 1),
                "MAB3_Students": get_student_count(month, hour, day_name, day_of_month, "mab", 2),
                "MAB4_Students": get_student_count(month, hour, day_name, day_of_month, "mab", 3),
                "Active_Windows_Labs": get_lab_count(hour, day_name, month, day_of_month),
                "Active_Mac_Labs": get_lab_count(hour, day_name, month, day_of_month),
                "Central_Library_Occupancy": get_library_occupancy(hour, day_name, month, day_of_month),
                "Admin_Office_Staff": get_admin_staff(hour, day_name, month, day_of_month),
                "Glass_Cafeteria_Occupancy": get_cafeteria_occupancy(hour, day_name, month, day_of_month, "glass"),
                "Open_Cafeteria_Occupancy": get_cafeteria_occupancy(hour, day_name, month, day_of_month, "open"),
                "Auditorium_Active": get_auditorium_active(hour, day_name, month, day_of_month),
                "Boys_Hostel_Load_kWh": get_hostel_load(hour, month, "boys"),
                "Girls_Hostel_Load_kWh": get_hostel_load(hour, month, "girls"),
                "Solar_Generation_kWh": get_solar_generation(hour, month, day_of_month),
            }
            
            # Compute the target variable
            row["Electricity_Consumption_kWh"] = compute_electricity_consumption(row)
            row["Net_Grid_Usage_kWh"] = round(row["Electricity_Consumption_kWh"] - row["Solar_Generation_kWh"], 1)
            
            rows.append(row)
        
        current_date += timedelta(days=1)
    
    # Train Isolation Forest for Anomaly Detection
    df = pd.DataFrame(rows)
    features = ['Electricity_Consumption_kWh', 'Temperature_C', 'Humidity_%']
    iso_forest = IsolationForest(contamination=0.03, random_state=42)
    iso_forest.fit(df[features])
    df['Anomaly_Score'] = iso_forest.decision_function(df[features])
    df['Is_Anomaly'] = (iso_forest.predict(df[features]) == -1).astype(int)
    
    for i, row in enumerate(rows):
        row['Anomaly_Score'] = round(df.loc[i, 'Anomaly_Score'], 4)
        row['Is_Anomaly'] = int(df.loc[i, 'Is_Anomaly'])
    
    print(f"\n[OK] Generated {len(rows)} hourly records with Anomalies detected")
    print(f"     Date range: {rows[0]['Date']} to {rows[-1]['Date']}")
    return rows


def create_database(rows):
    """Create SQLite database and populate with generated data."""
    os.makedirs(DB_DIR, exist_ok=True)
    
    # Remove existing database if present
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"[OK] Removed existing database at {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create the main campus_data table with all 25 original columns
    cursor.execute("""
        CREATE TABLE campus_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Date TEXT NOT NULL,
            Day TEXT NOT NULL,
            Time TEXT NOT NULL,
            Temperature_C REAL NOT NULL,
            "Humidity_%" INTEGER NOT NULL,
            AB1_Students INTEGER NOT NULL,
            AB2_Students INTEGER NOT NULL,
            AB3_Students INTEGER NOT NULL,
            AB4_Students INTEGER NOT NULL,
            AB5_Students INTEGER NOT NULL,
            MAB1_Students INTEGER NOT NULL,
            MAB2_Students INTEGER NOT NULL,
            MAB3_Students INTEGER NOT NULL,
            MAB4_Students INTEGER NOT NULL,
            Active_Windows_Labs INTEGER NOT NULL,
            Active_Mac_Labs INTEGER NOT NULL,
            Central_Library_Occupancy INTEGER NOT NULL,
            Admin_Office_Staff INTEGER NOT NULL,
            Glass_Cafeteria_Occupancy INTEGER NOT NULL,
            Open_Cafeteria_Occupancy INTEGER NOT NULL,
            Auditorium_Active INTEGER NOT NULL,
            Boys_Hostel_Load_kWh INTEGER NOT NULL,
            Girls_Hostel_Load_kWh INTEGER NOT NULL,
            Solar_Generation_kWh INTEGER NOT NULL,
            Electricity_Consumption_kWh REAL NOT NULL,
            Net_Grid_Usage_kWh REAL NOT NULL,
            Anomaly_Score REAL NOT NULL,
            Is_Anomaly INTEGER NOT NULL
        )
    """)
    
    # Insert all rows
    columns = [
        "Date", "Day", "Time", "Temperature_C", "Humidity_%",
        "AB1_Students", "AB2_Students", "AB3_Students", "AB4_Students", "AB5_Students",
        "MAB1_Students", "MAB2_Students", "MAB3_Students", "MAB4_Students",
        "Active_Windows_Labs", "Active_Mac_Labs", "Central_Library_Occupancy",
        "Admin_Office_Staff", "Glass_Cafeteria_Occupancy", "Open_Cafeteria_Occupancy",
        "Auditorium_Active", "Boys_Hostel_Load_kWh", "Girls_Hostel_Load_kWh",
        "Solar_Generation_kWh", "Electricity_Consumption_kWh", "Net_Grid_Usage_kWh",
        "Anomaly_Score", "Is_Anomaly"
    ]
    
    placeholders = ", ".join(["?"] * len(columns))
    # Quote column names for SQL compatibility (Humidity_%)
    col_names_sql = ", ".join([f'"{c}"' for c in columns])
    insert_sql = f"INSERT INTO campus_data ({col_names_sql}) VALUES ({placeholders})"
    
    data_tuples = [tuple(row[c] for c in columns) for row in rows]
    cursor.executemany(insert_sql, data_tuples)
    
    conn.commit()
    
    # Create indices for common query patterns
    cursor.execute("CREATE INDEX idx_date ON campus_data(Date)")
    cursor.execute("CREATE INDEX idx_month ON campus_data(Date)")
    
    # Verify
    count = cursor.execute("SELECT COUNT(*) FROM campus_data").fetchone()[0]
    date_range = cursor.execute("SELECT MIN(Date), MAX(Date) FROM campus_data").fetchone()
    avg_elec = cursor.execute("SELECT AVG(Electricity_Consumption_kWh) FROM campus_data").fetchone()[0]
    
    conn.close()
    
    print(f"\n[OK] SQLite database created at: {DB_PATH}")
    print(f"     Total records: {count}")
    print(f"     Date range: {date_range[0]} to {date_range[1]}")
    print(f"     Avg electricity: {avg_elec:.1f} kWh")
    print(f"     DB file size: {os.path.getsize(DB_PATH) / 1024:.1f} KB")


def verify_database():
    """Run quick verification checks on the generated database."""
    print("\n" + "=" * 60)
    print("  DATABASE VERIFICATION")
    print("=" * 60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Row count per month
    print("\nRows per month:")
    for month in range(1, 7):
        month_str = f"2026-{month:02d}"
        count = cursor.execute(
            "SELECT COUNT(*) FROM campus_data WHERE Date LIKE ?", (f"{month_str}%",)
        ).fetchone()[0]
        print(f"  {month_str}: {count} rows")
    
    # 2. Value ranges for key columns
    print("\nValue ranges:")
    checks = [
        ("Temperature_C", "REAL"),
        ("\"Humidity_%\"", "INT"),
        ("Electricity_Consumption_kWh", "REAL"),
        ("Solar_Generation_kWh", "INT"),
        ("Boys_Hostel_Load_kWh", "INT"),
        ("Girls_Hostel_Load_kWh", "INT"),
        ("AB1_Students", "INT"),
    ]
    for col, _ in checks:
        stats = cursor.execute(
            f"SELECT MIN({col}), MAX({col}), AVG({col}) FROM campus_data"
        ).fetchone()
        print(f"  {col}: min={stats[0]}, max={stats[1]}, avg={stats[2]:.1f}")
    
    # 3. Check all 7 days are present
    days = cursor.execute("SELECT DISTINCT Day FROM campus_data ORDER BY Day").fetchall()
    print(f"\nUnique days: {[d[0] for d in days]}")
    
    # 4. Check time slots
    times = cursor.execute("SELECT DISTINCT Time FROM campus_data ORDER BY Time").fetchall()
    print(f"Time slots: {len(times)} (expected 24)")
    
    conn.close()
    print("\n[OK] Verification complete!")


if __name__ == "__main__":
    rows = generate_dataset()
    create_database(rows)
    verify_database()
