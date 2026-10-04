const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const message = document.getElementById("loginMessage");

    if (email === "" || password === "") {
        message.textContent = "Vui lòng nhập đầy đủ thông tin!";
        return;
    }

    if (email === "admin@gmail.com" && password === "123456") {
        message.textContent = "Đăng nhập thành công!";
        window.location.href = "index.html";

    } else {
        message.textContent = "Email hoặc mật khẩu không đúng!";
    }
});