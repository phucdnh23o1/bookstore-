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


# -------------------------------------------------------------
# QUẢN LÝ GIỎ HÀNG (CART MANAGEMENT)
# -------------------------------------------------------------

# 1. THÊM SÁCH VÀO GIỎ HÀNG
@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    data = request.form if request.form else request.get_json()
    book_id = str(data.get('book_id'))
    quantity = int(data.get('quantity', 1))

    # Kiểm tra sách có tồn tại trong CSDL không
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'status': 'error', 'message': 'Sách không tồn tại!'}), 404

    # Khởi tạo giỏ hàng trong session nếu chưa có
    if 'cart' not in session:
        session['cart'] = {}

    cart = session['cart']

    # Nếu sách đã có trong giỏ -> tăng số lượng, nếu chưa -> thêm mới
    if book_id in cart:
        cart[book_id] += quantity
    else:
        cart[book_id] = quantity

    session.modified = True  # Báo cho Flask biết session đã được thay đổi

    return jsonify({
        'status': 'success', 
        'message': f'Đã thêm "{book.title}" vào giỏ hàng!',
        'total_items': sum(cart.values())
    })


# 2. XEM CHI TIẾT GIỎ HÀNG
@app.route('/cart')
def view_cart():
    cart = session.get('cart', {})
    cart_items = []
    total_price = 0

    # Lấy thông tin chi tiết từng cuốn sách từ CSDL dựa trên ID trong cart
    for book_id, quantity in cart.items():
        book = Book.query.get(int(book_id))
        if book:
            item_total = book.price * quantity
            total_price += item_total
            cart_items.append({
                'book': book,
                'quantity': quantity,
                'item_total': item_total
            })

    return render_template('cart.html', cart_items=cart_items, total_price=total_price)


# 3. CẬP NHẬT SỐ LƯỢNG TRONG GIỎ HÀNG
@app.route('/cart/update', methods=['POST'])
def update_cart():
    data = request.form if request.form else request.get_json()
    book_id = str(data.get('book_id'))
    quantity = int(data.get('quantity', 1))

    if 'cart' in session and book_id in session['cart']:
        if quantity > 0:
            session['cart'][book_id] = quantity
        else:
            session['cart'].pop(book_id, None)  # Nếu số lượng <= 0 thì xóa khỏi giỏ
        session.modified = True
        return jsonify({'status': 'success', 'message': 'Đã cập nhật giỏ hàng!'})

    return jsonify({'status': 'error', 'message': 'Sách không có trong giỏ hàng!'}), 400


# 4. XÓA MỘT MÓN HÀNG KHỎI GIỎ
@app.route('/cart/remove', methods=['POST'])
def remove_from_cart():
    data = request.form if request.form else request.get_json()
    book_id = str(data.get('book_id'))

    if 'cart' in session and book_id in session['cart']:
        session['cart'].pop(book_id, None)
        session.modified = True
        return jsonify({'status': 'success', 'message': 'Đã xóa sách khỏi giỏ hàng!'})

    return jsonify({'status': 'error', 'message': 'Sách không có trong giỏ hàng!'}), 400