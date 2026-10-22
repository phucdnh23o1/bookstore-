from flask import current_app as app, render_template, request, redirect, url_for, session, jsonify
from app.models import db, User, Book, Order, OrderItem

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

# 1. Route hiển thị giao diện đăng ký (GET)
@app.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')

# login
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

# Route dùng để hiển thị giao diện đăng nhập (GET)
@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

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



# -------------------------------------------------------------
# ROUTE HIỂN THỊ CHI TIẾT SÁCH (GET)
# -------------------------------------------------------------
@app.route('/books/<int:book_id>')
def book_detail(book_id):
    # Tìm sách theo ID trong CSDL, nếu không thấy sẽ trả về lỗi 404
    book = Book.query.get_or_404(book_id)
    
    # Truyền biến 'book' sang template book_detail.html
    return render_template('book_detail.html', book=book)

# ROUTE XỬ LÝ ĐẶT HÀNG
@app.route('/checkout', methods=['POST'])
def checkout():
    # 1. Kiểm tra đăng nhập
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Vui lòng đăng nhập để đặt hàng!'}), 401

    # Lấy dữ liệu từ Request (JSON)
    data = request.get_json() or {}
    address = data.get('address')
    contact = data.get('contact')

    # Kiểm tra dữ liệu bắt buộc
    if not address or not contact:
        return jsonify({'status': 'error', 'message': 'Vui lòng cung cấp đầy đủ địa chỉ và số điện thoại!'}), 400
    
    # 2. Lấy giỏ hàng từ session
    cart = session.get('cart', {})
    if not cart:
        return jsonify({'status': 'error', 'message': 'Giỏ hàng của bạn đang trống!'}), 400

    user_id = session['user_id']
    total_price = 0
    items_to_create = []

    # 3. Tính tổng tiền, kiểm tra tồn kho và chuẩn bị danh sách
    for book_id_str, quantity in cart.items():
        book = Book.query.get(int(book_id_str))
        if book:
            # KIỂM TRA TỒN KHO: Nếu số lượng đặt lớn hơn số lượng trong kho
            if book.stock < quantity:
                return jsonify({
                    'status': 'error', 
                    'message': f'Sách "{book.title}" chỉ còn {book.stock} cuốn, không đủ số lượng bạn đặt ({quantity})!'
                }), 400

            item_total = book.price * quantity
            total_price += item_total
            items_to_create.append({
                'book': book,
                'quantity': quantity,
                'price': book.price
            })

    try:
        # 4. Tạo Order mới
        new_order = Order(
            user_id=user_id,
            total_price=total_price,
            status='Đã đặt',
            address=address,
            contact=contact
        )
        db.session.add(new_order)
        db.session.flush()  # Tạo ID cho order để dùng cho OrderItem

        # 5. Tạo từng OrderItem VÀ TRỪ TỒN KHO
        for item in items_to_create:
            book = item['book']
            qty = item['quantity']

            # Cập nhật OrderItem
            order_item = OrderItem(
                order_id=new_order.id,
                book_id=book.id,
                quantity=qty,
                price=item['price']
            )
            db.session.add(order_item)

            # TRỪ SỐ LƯỢNG TỒN KHO TRONG DATABASE
            book.stock -= qty

        # Commit tất cả thay đổi (Tạo Order, OrderItem và Cập nhật Stock) trong 1 transaction
        db.session.commit()

        # 6. Xóa sạch giỏ hàng trong session sau khi lưu DB thành công
        session.pop('cart', None)
        session.modified = True

        return jsonify({
            'status': 'success', 
            'message': 'Đặt hàng thành công!', 
            'order_id': new_order.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'Lỗi đặt hàng: {str(e)}'}), 500

#   LUU DON DA DAT HANG THANH CONG
    @app.route('/orders')
    def view_orders():
        # 1. Kiểm tra đăng nhập
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập để xem lịch sử đơn hàng!', 'warning')
            return redirect(url_for('login'))

        user_id = session['user_id']
        
        # 2. Lấy danh sách các đơn hàng của user, sắp xếp mới nhất lên đầu
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.id.desc()).all()

        return render_template('orders.html', orders=orders)