
import csv
import os
import re
import unicodedata

from app import create_app
from app.models import db, Book, User, OrderItem


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, "book.csv")
IMAGE_DIR = os.path.join(BASE_DIR, "app", "static", "images")


def normalize(text):
    text = str(text or "").strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(
        c for c in text
        if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"[^a-z0-9]+", "_", text).strip("_")


def find_column(headers, aliases):
    for alias in aliases:
        alias = normalize(alias)
        if alias in headers:
            return headers.index(alias)
    return None


def find_image(image_value):
    if not image_value:
        return None

    filename = os.path.basename(str(image_value).strip())
    image_path = os.path.join(IMAGE_DIR, filename)

    if os.path.isfile(image_path):
        return "images/" + filename

    print(f"Không tìm thấy ảnh: {filename}")
    return None


def read_csv():
    if not os.path.isfile(CSV_FILE):
        raise FileNotFoundError(
            f"Không tìm thấy file CSV: {CSV_FILE}"
        )

    with open(
        CSV_FILE, "r", encoding="utf-8-sig", newline=""
    ) as file:
        sample = file.read(4096)
        file.seek(0)

        try:
            dialect = csv.Sniffer().sniff(
                sample, delimiters=",;\t|"
            )
        except csv.Error:
            dialect = csv.excel

        rows = list(csv.reader(file, dialect))

    rows = [
        row for row in rows
        if any(cell.strip() for cell in row)
    ]

    if not rows:
        raise ValueError("File book.csv không có dữ liệu.")

    aliases = {
        "id": ["id"],
        "title": ["title", "ten_sach", "tensach", "name"],
        "author": ["author", "tac_gia", "tacgia"],
        "price": ["price", "gia", "gia_ban"],
        "description": ["description", "mo_ta", "mota"],
        "image": [
            "image", "image_url", "image-url",
            "anh", "hinh_anh", "filename"
        ],
        "stock": ["stock", "quantity", "so_luong", "soluong"],
    }

    first_row = [normalize(value) for value in rows[0]]

    title_index = find_column(first_row, aliases["title"])
    author_index = find_column(first_row, aliases["author"])
    price_index = find_column(first_row, aliases["price"])

    has_header = (
        title_index is not None
        and author_index is not None
        and price_index is not None
    )

    if has_header:
        headers = first_row
        data_rows = rows[1:]
    else:
        raise ValueError(
            "CSV cần có tiêu đề cột: id,title,author,price,"
            "description,image-url,stock"
        )

    indexes = {
        key: find_column(headers, names)
        for key, names in aliases.items()
    }

    if (
        indexes["title"] is None
        or indexes["author"] is None
        or indexes["price"] is None
    ):
        raise ValueError("CSV thiếu cột title, author hoặc price.")

    def get_value(row, key, default=""):
        index = indexes[key]

        if index is None or index >= len(row):
            return default

        return row[index].strip()

    books = []

    for line_number, row in enumerate(data_rows, start=2):
        try:
            title = get_value(row, "title")
            author = get_value(row, "author")
            price_text = get_value(row, "price")
            stock_text = get_value(row, "stock", "0")
            description = get_value(row, "description")
            image_text = get_value(row, "image")

            if not title or not author:
                print(f"Bỏ qua dòng {line_number}: thiếu tên hoặc tác giả")
                continue

            price = float(
                price_text.replace(" ", "").replace(",", "")
            )
            stock = int(float(stock_text or "0"))

            if price < 0 or stock < 0:
                raise ValueError("Giá hoặc số lượng âm")

            books.append({
                "title": title,
                "author": author,
                "price": price,
                "stock": stock,
                "description": description,
                "image_url": find_image(image_text),
            })

        except (ValueError, IndexError) as error:
            print(f"Bỏ qua dòng {line_number}: {error}")

    return books


def seed_database():
    app = create_app()

    with app.app_context():
        # Đọc và kiểm tra CSV trước khi xóa dữ liệu cũ
        book_data = read_csv()

        if not book_data:
            print("Không có sách hợp lệ. Không xóa dữ liệu cũ.")
            return

        db.create_all()

        try:
            # Xóa chi tiết đơn hàng trước do có khóa ngoại tới sách
            OrderItem.query.delete(synchronize_session=False)

            # Xóa toàn bộ sách cũ
            Book.query.delete(synchronize_session=False)

            # Nạp lại sách từ CSV
            images_found = 0

            for data in book_data:
                book = Book(
                    title=data["title"],
                    author=data["author"],
                    price=data["price"],
                    stock=data["stock"],
                    description=data["description"],
                    image_url=data["image_url"],
                )

                db.session.add(book)

                if data["image_url"]:
                    images_found += 1

            # Tạo tài khoản mẫu nếu chưa có
            if not User.query.filter_by(username="admin").first():
                db.session.add(User(
                    username="admin",
                    password="admin123",
                    role="admin"
                ))

            if not User.query.filter_by(username="user").first():
                db.session.add(User(
                    username="user",
                    password="user123",
                    role="user"
                ))

            db.session.commit()

            print("\n===== SEED THÀNH CÔNG =====")
            print(f"Số sách đã nạp: {len(book_data)}")
            print(f"Số sách có ảnh hợp lệ: {images_found}")
            print(f"Số sách không có ảnh: {len(book_data) - images_found}")
            print(f"Thư mục ảnh: {IMAGE_DIR}")

        except Exception:
            db.session.rollback()
            raise


if __name__ == "__main__":
    seed_database()
