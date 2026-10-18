document.addEventListener("DOMContentLoaded", async function () {

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
    // 3. ĐỌC PHẢN HỒI JSON
    // =====================================
    async function readJsonResponse(response) {
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "Máy chủ không trả về JSON. Vui lòng kiểm tra lại."
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
                showMessage(
                    message,
                    "Form đăng nhập không đầy đủ.",
                    "login-message error"
                );
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
                    "Form đăng ký không đầy đủ.",
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

                value = Math.max(value, min);

                if (input.max !== "") {
                    value = Math.min(value, Number(input.max));
                }

                input.value = value;
            });
        }
    );
        // =====================================
    // 8. ĐỒNG BỘ GIỎ HÀNG
    // =====================================

    // localStorage chỉ lưu trạng thái giao diện.
    // Giỏ hàng thật được lưu trong Flask session.
    function readAddedBooks() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("addedBooks") || "[]"
            );

            return new Set(
                Array.isArray(saved) ? saved.map(String) : []
            );
        } catch (error) {
            console.warn(
                "Không đọc được trạng thái giỏ hàng đã lưu:",
                error
            );

            return new Set();
        }
    }

    const addedBooks = readAddedBooks();

    function saveAddedBooks() {
        localStorage.setItem(
            "addedBooks",
            JSON.stringify([...addedBooks])
        );
    }

    function setAddButtonState(button, isAdded) {
        if (isAdded) {
            button.textContent = "Đã thêm vào giỏ";
            button.classList.add("added-to-cart");
            button.disabled = true;
        } else {
            button.textContent = "Thêm vào giỏ";
            button.classList.remove("added-to-cart");
            button.disabled = false;
        }
    }

    // Lấy danh sách sách thực tế từ trang giỏ hàng.
    async function syncAddedBooksWithServer() {
        try {
            const response = await fetch("/cart", {
                method: "GET",
                headers: {
                    "Accept": "text/html"
                },
                cache: "no-store",
                credentials: "same-origin"
            });

            if (!response.ok) {
                throw new Error(
                    "Không thể đồng bộ giỏ hàng từ máy chủ."
                );
            }

            const html = await response.text();

            const cartDocument = new DOMParser().parseFromString(
                html,
                "text/html"
            );

            const actualBookIds = new Set();

            // cart.html cần có id="cart-item-ID" cho từng sách.
            cartDocument
                .querySelectorAll('[id^="cart-item-"]')
                .forEach(function (item) {
                    const bookId = item.id.substring(
                        "cart-item-".length
                    );

                    if (bookId) {
                        actualBookIds.add(String(bookId));
                    }
                });

            // Thay dữ liệu cũ bằng dữ liệu thật trên máy chủ.
            addedBooks.clear();

            actualBookIds.forEach(function (bookId) {
                addedBooks.add(bookId);
            });

            saveAddedBooks();

        } catch (error) {
            console.warn(
                "Không đồng bộ được giỏ hàng:",
                error
            );

            // Không để dữ liệu cũ khóa nhầm nút thêm sách.
            addedBooks.clear();
            saveAddedBooks();
        }
    }

    // Chờ đồng bộ trước khi thiết lập trạng thái nút.
    await syncAddedBooksWithServer();

    document
        .querySelectorAll(".add-to-cart-button")
        .forEach(function (button) {
            const bookId = button.dataset.bookId;

            if (bookId) {
                setAddButtonState(
                    button,
                    addedBooks.has(String(bookId))
                );
            }
        });

    // =====================================
    // 9. THÊM SÁCH VÀO GIỎ HÀNG
    // =====================================
    document
        .querySelectorAll(".add-to-cart-button")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                async function (event) {
                    event.preventDefault();

                    const bookId = button.dataset.bookId;

                    if (
                        !bookId ||
                        button.disabled ||
                        button.dataset.adding === "true"
                    ) {
                        return;
                    }

                    button.dataset.adding = "true";
                    button.disabled = true;
                    button.textContent = "Đang thêm...";

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

                        if (
                            !response.ok ||
                            result.status !== "success"
                        ) {
                            throw new Error(
                                result.message ||
                                "Không thể thêm sách vào giỏ hàng."
                            );
                        }

                        // Thêm thành công.
                        button.textContent = "Đã thêm vào giỏ";
                        button.classList.add("added-to-cart");
                        button.disabled = true;

                        addedBooks.add(String(bookId));
                        saveAddedBooks();

                    } catch (error) {
                        console.error("Lỗi thêm sách:", error);

                        alert(
                            error.message ||
                            "Không thể kết nối đến máy chủ."
                        );

                        button.disabled = false;
                        button.textContent = "Thêm vào giỏ";

                    } finally {
                        delete button.dataset.adding;
                    }
                }
            );
        });

    // =====================================
    // 10. TÍNH TIỀN TỨC THÌ
    // =====================================
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString("vi-VN") + " VNĐ";
    }

    function recalculateCartTotals() {
        const forms = document.querySelectorAll(
            ".cart-quantity-form"
        );

        let total = 0;

        for (const form of forms) {
            const quantityInput = form.querySelector(
                '[name="quantity"]'
            );

            const bookIdInput = form.querySelector(
                '[name="book_id"]'
            );

            if (!quantityInput || !bookIdInput) {
                continue;
            }

            const quantity = Number(quantityInput.value);
            const max = Number(quantityInput.max);

            // Không tính tiền khi số lượng không hợp lệ.
            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                (
                    quantityInput.max !== "" &&
                    quantity > max
                )
            ) {
                return;
            }

            const itemTotal = document.getElementById(
                "item-total-" + bookIdInput.value
            );

            if (!itemTotal) {
                continue;
            }

            const price = Number(itemTotal.dataset.price);
            const subtotal = price * quantity;

            itemTotal.textContent = formatMoney(subtotal);
            total += subtotal;
        }

        const subtotalElement = document.getElementById(
            "cart-subtotal"
        );

        const totalElement = document.getElementById(
            "cart-total"
        );

        if (subtotalElement) {
            subtotalElement.textContent = formatMoney(total);
        }

        if (totalElement) {
            totalElement.textContent = formatMoney(total);
        }
    }

    // Tính lại tiền khi người dùng thay đổi số lượng.
    document
        .querySelectorAll(".cart-quantity-form")
        .forEach(function (form) {
            const quantityInput = form.querySelector(
                '[name="quantity"]'
            );

            if (!quantityInput) {
                return;
            }

            quantityInput.dataset.savedQuantity =
                quantityInput.value;

            quantityInput.addEventListener(
                "input",
                recalculateCartTotals
            );

            quantityInput.addEventListener(
                "change",
                recalculateCartTotals
            );
        });
            // =====================================
    // 11. CẬP NHẬT GIỎ HÀNG KHÔNG TẢI LẠI TRANG
    // =====================================
    document
        .querySelectorAll(".cart-quantity-form")
        .forEach(function (form) {
            form.addEventListener(
                "submit",
                async function (event) {
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
                        return;
                    }

                    const bookId = bookIdInput.value;
                    const quantity = Number(quantityInput.value);
                    const max = Number(quantityInput.max);

                    if (
                        !Number.isInteger(quantity) ||
                        quantity < 1 ||
                        (
                            quantityInput.max !== "" &&
                            quantity > max
                        )
                    ) {
                        alert(
                            "Vui lòng nhập số lượng hợp lệ trong giới hạn tồn kho."
                        );
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

                        if (
                            !response.ok ||
                            result.status !== "success"
                        ) {
                            throw new Error(
                                result.message ||
                                "Cập nhật giỏ hàng thất bại."
                            );
                        }

                        quantityInput.dataset.savedQuantity =
                            quantity;

                        recalculateCartTotals();

                        alert(
                            result.message ||
                            "Đã cập nhật giỏ hàng!"
                        );

                    } catch (error) {
                        // Khôi phục số lượng trước khi cập nhật.
                        quantityInput.value =
                            quantityInput.dataset.savedQuantity;

                        recalculateCartTotals();

                        alert(
                            error.message ||
                            "Không thể kết nối đến máy chủ."
                        );

                    } finally {
                        if (button) {
                            button.disabled = false;
                        }
                    }
                }
            );
        });

    // =====================================
    // 12. XÓA SÁCH KHỎI GIỎ HÀNG
    // =====================================
    document
        .querySelectorAll(".cart-remove-form")
        .forEach(function (form) {
            form.addEventListener(
                "submit",
                async function (event) {
                    event.preventDefault();

                    const bookIdInput = form.querySelector(
                        '[name="book_id"]'
                    );

                    const button = form.querySelector(
                        'button[type="submit"]'
                    );

                    if (!bookIdInput) {
                        return;
                    }

                    const bookId = String(bookIdInput.value);

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
                                book_id: bookId
                            })
                        });

                        const result = await readJsonResponse(response);

                        if (
                            !response.ok ||
                            result.status !== "success"
                        ) {
                            throw new Error(
                                result.message || "Xóa sách thất bại."
                            );
                        }

                        // Xóa trạng thái đã thêm trong trình duyệt.
                        addedBooks.delete(bookId);
                        saveAddedBooks();

                        // Xóa sách khỏi giao diện.
                        const item = document.getElementById(
                            "cart-item-" + bookId
                        );

                        if (item) {
                            item.remove();
                        }

                        recalculateCartTotals();

                        // Nếu giỏ hàng đã trống.
                        if (
                            !document.querySelector(
                                ".cart-quantity-form"
                            )
                        ) {
                            const cartItems =
                                document.querySelector(".cart-items");

                            if (cartItems) {
                                const continueLink =
                                    document.querySelector(
                                        ".cart-summary .continue-shopping-button"
                                    );

                                const booksUrl = continueLink
                                    ? continueLink.href
                                    : "/books";

                                const emptyCart =
                                    document.createElement("div");

                                emptyCart.className = "empty-cart";

                                const heading =
                                    document.createElement("h2");

                                heading.textContent =
                                    "Giỏ hàng đang trống";

                                const paragraph =
                                    document.createElement("p");

                                paragraph.textContent =
                                    "Bạn chưa có sản phẩm nào trong giỏ hàng.";

                                const link =
                                    document.createElement("a");

                                link.href = booksUrl;
                                link.className =
                                    "continue-shopping-button";

                                link.textContent =
                                    "Tiếp tục mua sắm";

                                emptyCart.append(
                                    heading,
                                    paragraph,
                                    link
                                );

                                cartItems.appendChild(emptyCart);
                            }

                            // Vô hiệu hóa nút thanh toán.
                            const checkoutButton =
                                document.querySelector(
                                    ".cart-summary .checkout-button"
                                );

                            if (checkoutButton) {
                                const disabledButton =
                                    document.createElement("button");

                                disabledButton.type = "button";
                                disabledButton.className =
                                    "checkout-button";

                                disabledButton.disabled = true;

                                disabledButton.textContent =
                                    "Tiến hành thanh toán";

                                checkoutButton.replaceWith(
                                    disabledButton
                                );
                            }

                            const placeOrderButton =
                                document.querySelector(
                                    ".checkout-form .place-order-button"
                                );

                            if (placeOrderButton) {
                                placeOrderButton.disabled = true;
                            }
                        }

                        // Không hiện thông báo khi xóa thành công.

                    } catch (error) {
                        console.error("Lỗi xóa sách:", error);

                        alert(
                            error.message ||
                            "Không thể kết nối đến máy chủ."
                        );

                    } finally {
                        if (button) {
                            button.disabled = false;
                        }
                    }
                }
            );
        });

    // =====================================
    // 13. GỬI FORM THANH TOÁN
    // =====================================
    const checkoutForm = document.querySelector(".checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                if (!checkoutForm.reportValidity()) {
                    return;
                }

                const button = checkoutForm.querySelector(
                    'button[type="submit"]'
                );

                if (button) {
                    button.disabled = true;
                }

                try {
                    const response = await fetch(
                        checkoutForm.action,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8",
                                "Accept": "application/json"
                            },
                            body: getFormData(checkoutForm)
                        }
                    );

                    const result = await readJsonResponse(response);

                    if (
                        !response.ok ||
                        result.status !== "success"
                    ) {
                        if (response.status === 401) {
                            alert(
                                "Vui lòng đăng nhập để đặt hàng!"
                            );

                            window.location.href = "/login";
                            return;
                        }

                        throw new Error(
                            result.message || "Đặt hàng thất bại."
                        );
                    }

                    // Backend đã xóa giỏ hàng sau khi đặt hàng.
                    // Xóa trạng thái cũ để nút thêm sách không bị sai.
                    addedBooks.clear();
                    saveAddedBooks();

                    alert(
                        result.message +
                        (
                            result.order_id
                                ? "\nMã đơn hàng: " + result.order_id
                                : ""
                        )
                    );

                    window.location.href = "/";

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
            }
        );
    }

});