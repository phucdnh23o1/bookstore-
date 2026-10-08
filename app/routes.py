from flask import current_app as app, render_template, request, redirect, url_for, session, jsonify
from app.models import db, User, Book, Order

@app.route('/')
def index():
    featured_books = Book.query.limit(4).all()
    return render_template('index.html', books=featured_books)


@app.route('/books')
def get_all_books():
    all_books = Book.query.all()
    return render_template('books.html', books=all_books)


@app.route('/register', methods=['POST'])
def register():
    data = request.form if request.form else request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user') 

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Vui lòng điền đầy đủ username và password!'}), 400


    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'status': 'error', 'message': 'Tên đăng nhập đã tồn tại!'}), 400


    new_user = User(username=username, password=password, role=role)
    

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'Đăng ký tài khoản thành công!'}), 201


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
        return jsonify({'status': 'error', 'message': 'Tài khoản hoặc mật khẩu không đúng!'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))