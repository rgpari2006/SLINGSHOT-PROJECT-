"""SQLite data layer for demo startup metrics."""

from __future__ import annotations

import csv
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_FILE = BASE_DIR / "data" / "sample_startup_data.csv"
DB_FILE = BASE_DIR / "backend" / "database" / "slingshot.db"


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database() -> None:
    """Create table and seed it from sample CSV if empty."""
    conn = _get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS startup_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT NOT NULL,
            revenue REAL NOT NULL,
            retention_rate REAL NOT NULL,
            burn_rate REAL NOT NULL
        )
        """
    )

    cur.execute("SELECT COUNT(*) AS count FROM startup_metrics")
    count = cur.fetchone()["count"]

    if count == 0 and DATA_FILE.exists():
        with DATA_FILE.open("r", newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            rows = [
                (
                    row["month"],
                    float(row["revenue"]),
                    float(row["retention_rate"]),
                    float(row["burn_rate"]),
                )
                for row in reader
            ]
        cur.executemany(
            """
            INSERT INTO startup_metrics (month, revenue, retention_rate, burn_rate)
            VALUES (?, ?, ?, ?)
            """,
            rows,
        )

    conn.commit()
    conn.close()


def fetch_startup_data() -> list[dict]:
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT month, revenue, retention_rate, burn_rate
        FROM startup_metrics
        ORDER BY id ASC
        """
    )
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows
