"""Query the database to see logged actions"""
import sqlite3

db_path = "threads_automation.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("=" * 80)
print("ENGAGEMENT LOG (last 20 actions)")
print("=" * 80)
cursor = conn.execute("SELECT * FROM engagement_log ORDER BY timestamp DESC LIMIT 20")
rows = cursor.fetchall()
if rows:
    for row in rows:
        print(f"[{row['timestamp']}] {row['action_type']:8} | @{row['target_username'] or 'N/A':20} | {row['status']}")
else:
    print("No actions logged yet.")

print("\n" + "=" * 80)
print("SESSIONS (last 10)")
print("=" * 80)
cursor = conn.execute("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 10")
rows = cursor.fetchall()
if rows:
    for row in rows:
        print(f"[{row['started_at']}] {row['status']:10} | Likes: {row.get('likes_performed', 0)} | Follows: {row.get('follows_performed', 0)}")
else:
    print("No sessions logged yet.")

print("\n" + "=" * 80)
print("DAILY STATS")
print("=" * 80)
cursor = conn.execute("SELECT * FROM daily_limits ORDER BY date DESC LIMIT 5")
rows = cursor.fetchall()
if rows:
    for row in rows:
        print(f"[{row['date']}] Likes: {row['likes_count']} | Follows: {row['follows_count']} | Comments: {row['comments_count']}")
else:
    print("No daily stats yet.")

conn.close()






