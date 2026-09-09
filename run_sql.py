#!/usr/bin/env python3
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "backend" / "db.sqlite3"

def run_query(query: str):
    if not DB_PATH.exists():
        print(f"Error: La base de datos no se encuentra en {DB_PATH}")
        sys.exit(1)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(query)
        if query.strip().upper().startswith(("SELECT", "PRAGMA", "EXPLAIN", "WITH")):
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            print(" | ".join(columns))
            print("-" * (len(" | ".join(columns)) + 10))
            for row in rows:
                print(" | ".join(str(val) for val in row))
            print(f"\n({len(rows)} filas devueltas)")
        else:
            conn.commit()
            print(f"Consulta ejecutada correctamente. Filas afectadas: {cursor.rowcount}")
    except sqlite3.Error as e:
        print(f"Error SQL: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sql = " ".join(sys.argv[1:])
        run_query(sql)
    else:
        print("=== Entorno de Consultas SQL - Beraun PlantAI ===")
        print(f"Base de Datos SQLite: {DB_PATH}")
        print("Escribe tus consultas SQL (o 'exit' para salir):\n")
        while True:
            try:
                sql = input("SQL> ")
                if sql.strip().lower() in ("exit", "quit", "salir"):
                    break
                if sql.strip():
                    run_query(sql)
            except (EOFError, KeyboardInterrupt):
                break
