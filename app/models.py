from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta

VN_TZ = timezone(timedelta(hours=7))
def get_vn_time():
    return datetime.now(VN_TZ)

db = SQLAlchemy()
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='user')

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    stock = db.Column(db.Integer, default=0)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Đã đặt')
    created_at = db.Column(db.DateTime, default=get_vn_time)
    # Mối quan hệ tới bảng OrderItem (1 đơn hàng chứa nhiều item)
    items = db.relationship('OrderItem', backref='order', lazy=True)
    # Quan hệ với tài khoản đặt hàng
    user = db.relationship('User', backref='orders')
    # dia chi va so dien thoai
    address = db.Column(db.String(255), nullable=False)
    contact = db.Column(db.String(15), nullable=False)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)  # Lưu giá sách tại thời điểm đặt

    # Mối quan hệ để lấy thông tin cuốn sách trực tiếp từ item
    book = db.relationship('Book')
    