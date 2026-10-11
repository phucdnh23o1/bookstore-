
document.addEventListener("DOMContentLoaded", function () {
    // =========================
    // HIỂN THỊ THÔNG BÁO
    // =========================
    function showMessage(element, message, type) {
        if (!element) return;

        element.textContent = message;
        element.className = type;
    }

    // =========================
    // CHUYỂN DỮ LIỆU FORM
    // =========================
    function getFormData(form) {
        return new URLSearchParams(new FormData(form));
    }

    // =========================
    // FORM ĐĂNG NHẬP
    // =========================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("login-message");
            const button = loginForm.querySelector(
                'button[type="submit"]'
            );

            const username = loginForm.querySelector(
                '[name="username"]'
            ).value.trim();

            const password = loginForm.querySelector(
                '[name="password"]'
            ).value;

            if (!username || !password) {
                showMessage(
                    message,
                    "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.",
                    "login-message error"
                );
                return;
            }

            button.disabled = true;
            showMessage(
                message,
                "Đang kiểm tra thông tin...",
                "login-message"
            );

            try {
                const response = await fetch(loginForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    body: getFormData(loginForm)
                });

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Đăng nhập thất bại."
                    );
                }

                showMessage(
                    message,
                    result.message || "Đăng nhập thành công!",
                    "login-message success"
                );

                // Đăng nhập thành công, quay về trang chủ.
                window.location.href = "/";

            } catch (error) {
                showMessage(
                    message,
                    error.message || "Không thể kết nối đến máy chủ.",
                    "login-message error"
                );
            } finally {
                button.disabled = false;
            }
        });
    }

    // =========================
    // FORM ĐĂNG KÝ
    // =========================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("register-message");
            const button = registerForm.querySelector(
                'button[type="submit"]'
            );

            const username = registerForm.querySelector(
                '[name="username"]'
            ).value.trim();

            const password = registerForm.querySelector(
                '[name="password"]'
            ).value;

            const confirmPassword = registerForm.querySelector(
                '[name="confirm_password"]'
            ).value;

            if (!username || !password || !confirmPassword) {
                showMessage(
                    message,
                    "Vui lòng điền đầy đủ thông tin.",
                    "register-message error"
                );
                return;
            }

            // Kiểm tra mật khẩu ngay trên frontend.
            if (password !== confirmPassword) {
                showMessage(
                    message,
                    "Mật khẩu xác nhận không khớp.",
                    "register-message error"
                );
                return;
            }

            button.disabled = true;

            showMessage(
                message,
                "Đang tạo tài khoản...",
                "register-message"
            );

            try {
                // Chỉ gửi username và password đến backend.
                const data = new URLSearchParams();
                data.append("username", username);
                data.append("password", password);

                const response = await fetch(registerForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    body: data
                });

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Đăng ký thất bại."
                    );
                }

                showMessage(
                    message,
                    result.message || "Đăng ký thành công!",
                    "register-message success"
                );

                // Đăng ký xong, chuyển đến trang đăng nhập.
                window.location.href = "/login";

            } catch (error) {
                showMessage(
                    message,
                    error.message || "Không thể kết nối đến máy chủ.",
                    "register-message error"
                );
            } finally {
                button.disabled = false;
            }
        });
    }

    // =========================
    // GIỚI HẠN SỐ LƯỢNG SÁCH
    // =========================
    document.querySelectorAll(
        'input[type="number"]'
    ).forEach(function (input) {
        input.addEventListener("change", function () {
            const min = input.min !== "" ? Number(input.min) : 1;

            if (input.value === "" || Number(input.value) < min) {
                input.value = min;
            }

            if (input.max !== "") {
                const max = Number(input.max);

                if (Number(input.value) > max) {
                    input.value = max;
                }
            }
        });
    });

    // =========================
    // XÁC NHẬN TRƯỚC KHI XÓA
    // =========================
    document.querySelectorAll("[data-confirm]").forEach(function (element) {
        element.addEventListener("click", function (event) {
            const message =
                element.getAttribute("data-confirm") ||
                "Bạn có chắc chắn muốn thực hiện thao tác này?";

            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });
});