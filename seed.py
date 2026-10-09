from app import create_app
from app.models import db, User, Book

app = create_app()

with app.app_context():
    
    db.drop_all()
    
    db.create_all()

   
    admin = User(username='admin', password='admin123', role='admin')
    user1 = User(username='user1', password='123456', role='user')

   
    b1 = Book(title='Lập trình Python cơ bản', author='Nguyễn Văn A', price=120000, stock=20)
    b2 = Book(title='Học Flask qua dự án', author='Trần Văn B', price=150000, stock=15)

    
    db.session.add_all([admin, user1, b1, b2])
    db.session.commit()
    
    print("-> Nạp dữ liệu mẫu thành công!")