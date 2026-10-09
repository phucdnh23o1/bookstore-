import os
BASR_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "123456789"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASR_DIR, 'bookstore.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
