
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. HIỂN THỊ THÔNG BÁO
    // =====================================
    function showMessage(element, message, type) {
        if (!element) return;

        element.textContent = message;
        element.className = type;
    }

    // =====================================
    // 2. CHUYỂN DỮ LIỆU FORM
    // =====================================
    function getFormData(form) {
        return new URLSearchParams(new FormData(form));
    }

    // =====================================
    // 3. XỬ LÝ PHẢN HỒI JSON
    // =====================================
    async function readJsonResponse(response) {
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "Máy chủ không trả về JSON. Hãy kiểm tra routes.py."
            );
        }

        return await response.json();
    }

    // =====================================
    // 4. ĐĂNG NHẬP
    // =====================================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("login-message");
            const button = loginForm.querySelector(
                'button[type="submit"]'
            );

            const usernameInput = loginForm.querySelector(
                '[name="username"]'
            );
            const passwordInput = loginForm.querySelector(
                '[name="password"]'
            );

            if (!usernameInput || !passwordInput || !button) {
                console.error("Form đăng nhập thiếu trường dữ liệu.");
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showMessage(
                    message,
                    "Vui lòng nhập tên đăng nhập và mật khẩu.",
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
                            "application/x-www-form-urlencoded;charset=UTF-8",
                        "Accept": "application/json"
                    },
                    body: getFormData(loginForm)
                });

                const result = await readJsonResponse(response);

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

                window.location.href = result.redirect || "/";

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

    // =====================================
    // 5. ĐĂNG KÝ
    // =====================================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("register-message");
            const button = registerForm.querySelector(
                'button[type="submit"]'
            );

            const usernameInput = registerForm.querySelector(
                '[name="username"]'
            );
            const passwordInput = registerForm.querySelector(
                '[name="password"]'
            );
            const confirmInput = registerForm.querySelector(
                '[name="confirm_password"]'
            );

            if (
                !usernameInput ||
                !passwordInput ||
                !confirmInput ||
                !button
            ) {
                showMessage(
                    message,
                    "Form đăng ký thiếu trường dữ liệu.",
                    "register-message error"
                );
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;

            if (!username || !password || !confirmPassword) {
                showMessage(
                    message,
                    "Vui lòng điền đầy đủ thông tin.",
                    "register-message error"
                );
                return;
            }

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
                const data = new URLSearchParams();
                data.append("username", username);
                data.append("password", password);

                const response = await fetch(registerForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                        "Accept": "application/json"
                    },
                    body: data
                });

                const result = await readJsonResponse(response);

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

                // Chuyển đến trang đăng nhập sau khi đăng ký.
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

    // =====================================
    // 6. MENU TÀI KHOẢN
    // =====================================
    const accountLabel = document.getElementById("accountLabel");
    const accountOptions = document.getElementById("accountOptions");

    if (accountLabel && accountOptions) {
        accountLabel.addEventListener("click", function (event) {
            event.stopPropagation();
            accountOptions.classList.toggle("show");
        });

        accountOptions.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".account-label")) {
                accountOptions.classList.remove("show");
            }
        });
    }

    // =====================================
    // 7. GIỚI HẠN SỐ LƯỢNG SÁCH
    // =====================================
    document.querySelectorAll('input[type="number"]').forEach(
        function (input) {
            input.addEventListener("change", function () {
                const min = input.min !== ""
                    ? Number(input.min)
                    : 1;

                let value = Number(input.value);

                if (input.value === "" || !Number.isFinite(value)) {
                    value = min;
                }

                if (value < min) {
                    value = min;
                }

                if (input.max !== "") {
                    const max = Number(input.max);

                    if (value > max) {
                        value = max;
                    }
                }

                input.value = value;
            });
        }
    );

    // =====================================
    // 8. XÁC NHẬN TRƯỚC KHI XÓA
    // =====================================
    document.querySelectorAll("[data-confirm]").forEach(
        function (element) {
            element.addEventListener("click", function (event) {
                const message =
                    element.getAttribute("data-confirm") ||
                    "Bạn có chắc chắn muốn thực hiện thao tác này?";

                if (!window.confirm(message)) {
                    event.preventDefault();
                }
            });
        }
    );

    // =====================================
    // 9. THÊM SÁCH VÀO GIỎ HÀNG
    // =====================================
    document.querySelectorAll(".add-to-cart-button").forEach(
        function (button) {
            button.addEventListener("click", async function (event) {
                event.preventDefault();

                const bookId = button.dataset.bookId;

                if (!bookId) {
                    alert("Không tìm thấy mã sách.");
                    return;
                }

                button.disabled = true;

                try {
                    const response = await fetch("/cart/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            book_id: bookId,
                            quantity: 1
                        })
                    });

                    const result = await readJsonResponse(response);

                    if (!response.ok || result.status !== "success") {
                        throw new Error(
                            result.message ||
                            "Không thể thêm sách vào giỏ hàng."
                        );
                    }

                    alert(result.message || "Đã thêm sách vào giỏ hàng!");

                } catch (error) {
                    console.error("Lỗi thêm giỏ hàng:", error);
                    alert(
                        error.message ||
                        "Không thể kết nối đến máy chủ."
                    );
                } finally {
                    button.disabled = false;
                }
            });
        }
    );

 
    // =====================================
    // 10. CẬP NHẬT SỐ LƯỢNG TRONG GIỎ HÀNG
    // =====================================
    document.querySelectorAll(".cart-quantity-form").forEach(
        function (form) {
            form.addEventListener("submit", async function (event) {
                event.preventDefault();

                const bookIdInput = form.querySelector(
                    '[name="book_id"]'
                );

                const quantityInput = form.querySelector(
                    '[name="quantity"]'
                );

                const button = form.querySelector(
                    'button[type="submit"]'
                );

                if (!bookIdInput || !quantityInput) {
                    alert("Không tìm thấy thông tin sách.");
                    return;
                }

                const bookId = bookIdInput.value;
                const quantity = Number(quantityInput.value);
                const max = Number(quantityInput.max);

                if (!Number.isInteger(quantity) || quantity < 1) {
                    alert("Số lượng phải là số nguyên lớn hơn 0.");
                    return;
                }

                if (quantityInput.max !== "" && quantity > max) {
                    alert("Số lượng vượt quá số sách còn trong kho.");
                    return;
                }

                if (button) {
                    button.disabled = true;
                }

                try {
                    const response = await fetch(form.action, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            book_id: bookId,
                            quantity: quantity
                        })
                    });

                    const result = await readJsonResponse(response);

                    if (!response.ok || result.status !== "success") {
                        throw new Error(
                            result.message ||
                            "Cập nhật giỏ hàng thất bại!"
                        );
                    }

                    alert(result.message || "Đã cập nhật giỏ hàng!");
                    window.location.reload();

                } catch (error) {
                    alert(
                        error.message ||
                        "Không thể kết nối đến máy chủ."
                    );
                } finally {
                    if (button) {
                        button.disabled = false;
                    }
                }
            });
        }
    );


});
