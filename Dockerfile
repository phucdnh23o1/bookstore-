# 1. Môi trường Python 3.10 mỏng nhẹ
FROM python:3.10-slim

# 2. Tạo thư mục chứa code bên trong container
WORKDIR /app

# 3. Copy file requirements.txt vào container và cài thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy toàn bộ code Backend vào container
COPY . .

# 5. Mở port 8000
EXPOSE 8000

# 6. Chạy app Backend
CMD ["python", "app.py"]