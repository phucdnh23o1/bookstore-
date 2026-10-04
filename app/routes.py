from flask import current_app as app, render_template, request, redirect, url_for, session, jsonify
from app.models import db, User, Book, Order

@app.route('/')
def index():
    books = Book.query.all()
    return render_template('index.html', books=books)

@app.route('/login', methods=['POST'])

def login():
    data = request.form if request.form else request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username, password=password).first()
    if user:
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        return jsonify({'status': 'success', 'message': 'Đăng nhập thành công!', 'role': user.role})
    else:
        return jsonify({'status': 'error', 'message': 'Sai tài khoản hoặc mật khẩu!'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

