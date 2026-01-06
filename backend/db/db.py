import os.path
import sqlite3


class DatabaseManager:
    def __init__(self, db_name='user.db'):
        self.db_path = os.path.join(os.path.dirname(__file__), db_name)
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.cur = self.conn.cursor()
        self._setup_tables()

    def _setup_tables(self):
        self.cur.execute("""
              CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT
            )
        """)
        self.cur.execute('INSERT INTO user VALUES (?, ?, ?)', (1, 'hjk', 'these990703@gmail.com'))
        data = self.cur.execute('SELECT * FROM user')
        print(data)
        self.conn.commit()


if __name__ == '__main__':
    db = DatabaseManager()
