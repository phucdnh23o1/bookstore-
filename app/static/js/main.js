
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================
    // 1. HÀM DÙNG CHUNG
    // =====================================

    function showMessage(element, message, type = "") {
        if (!element) return;

        element.textContent = message;
        element.className = type;
    }

    function formatMoney(amount) {
        return Math.round(amount).toLocaleString("vi-VN") + " VNĐ";
    }

    function getFormData(form) {
        return new URLSearchParams(new FormData(form));
    }

    async function readJsonResponse(response) {
        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "Máy chủ không trả về JSON. Hãy kiểm tra route Flask."
            );
        }

        return response.json();
    }

    async function postForm(form) {
        const response = await fetch(form.action, {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: getFormData(form),
            credentials: "same-origin"
        });

        const result = await readJsonResponse(response);

        if (!response.ok || result.status !== "success") {
            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Vui lòng đăng nhập để tiếp tục.");
            }

            throw new Error(
                result.message || "Yêu cầu không thành công."
            );
        }

        return result;
    }

    // =====================================
    // 2. ĐĂNG NHẬP
    // =====================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message =
                document.getElementById("login-message");

            const button = loginForm.querySelector(
                'button[type="submit"]'
            );

            const username = loginForm.querySelector(
                '[name="username"]'
            );

            const password = loginForm.querySelector(
                '[name="password"]'
            );

            if (!username || !password || !button) {
                showMessage(
                    message,
                    "Form đăng nhập không đầy đủ.",
                    "login-message error"
                );
                return;
            }

            if (!username.value.trim() || !password.value) {
                showMessage(
                    message,
                    "Vui lòng nhập tên đăng nhập và mật khẩu.",
                    "login-message error"
                );
                return;
            }

            if (button.disabled) return;

            button.disabled = true;

            showMessage(
                message,
                "Đang kiểm tra thông tin...",
                "login-message"
            );

            try {
                const result = await postForm(loginForm);

                showMessage(
                    message,
                    result.message || "Đăng nhập thành công!",
                    "login-message success"
                );

                window.location.href = result.redirect || "/";

            } catch (error) {
                showMessage(
                    message,
                    error.message || "Không thể kết nối máy chủ.",
                    "login-message error"
                );
            } finally {
                button.disabled = false;
            }
        });
    }

    // =====================================
    // 3. ĐĂNG KÝ
    // =====================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                const message =
                    document.getElementById("register-message");

                const button = registerForm.querySelector(
                    'button[type="submit"]'
                );

                const username = registerForm.querySelector(
                    '[name="username"]'
                );

                const password = registerForm.querySelector(
                    '[name="password"]'
                );

                const confirmPassword =
                    registerForm.querySelector(
                        '[name="confirm_password"]'
                    );

                if (
                    !username ||
                    !password ||
                    !confirmPassword ||
                    !button
                ) {
                    showMessage(
                        message,
                        "Form đăng ký không đầy đủ.",
                        "register-message error"
                    );
                    return;
                }

                if (
                    !username.value.trim() ||
                    !password.value ||
                    !confirmPassword.value
                ) {
                    showMessage(
                        message,
                        "Vui lòng điền đầy đủ thông tin.",
                        "register-message error"
                    );
                    return;
                }

                if (password.value !== confirmPassword.value) {
                    showMessage(
                        message,
                        "Mật khẩu xác nhận không khớp.",
                        "register-message error"
                    );
                    return;
                }

                if (button.disabled) return;

                button.disabled = true;

                showMessage(
                    message,
                    "Đang tạo tài khoản...",
                    "register-message"
                );

                try {
                    const result = await postForm(registerForm);

                    showMessage(
                        message,
                        result.message || "Đăng ký thành công!",
                        "register-message success"
                    );

                    window.location.href = "/login";

                } catch (error) {
                    showMessage(
                        message,
                        error.message || "Đăng ký thất bại.",
                        "register-message error"
                    );
                } finally {
                    button.disabled = false;
                }
            }
        );
    }


    // =====================================
    // 4. MENU TÀI KHOẢN
    // =====================================

    const accountLabel = document.getElementById("accountLabel");
    const accountOptions = document.getElementById("accountOptions");

    if (accountLabel && accountOptions) {
        accountLabel.setAttribute("aria-expanded", "false");

        function closeAccountMenu() {
            accountOptions.classList.remove("show");
            accountLabel.setAttribute("aria-expanded", "false");
        }

        accountLabel.addEventListener("click", function (event) {
            event.stopPropagation();

            const isOpen = accountOptions.classList.toggle("show");

            accountLabel.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        accountOptions.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        document.addEventListener("click", function () {
            closeAccountMenu();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeAccountMenu();
            }
        });
    }
    // =====================================
    // 5. KIỂM TRA SỐ LƯỢNG INPUT
    // =====================================

    function validateQuantity(input) {
        const min = input.min !== ""
            ? Number(input.min)
            : 1;

        const max = input.max !== ""
            ? Number(input.max)
            : Infinity;

        let quantity = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isFinite(quantity)
        ) {
            quantity = min;
        }

        quantity = Math.floor(quantity);
        quantity = Math.max(min, quantity);
        quantity = Math.min(max, quantity);

        input.value = quantity;

        return quantity;
    }

    document.querySelectorAll('input[type="number"]').forEach(
        function (input) {
            input.addEventListener("change", function () {
                validateQuantity(input);
            });
        }
    );

    // =====================================
    // 6. ĐỒNG BỘ GIỎ HÀNG VỚI MÁY CHỦ
    // =====================================

    const addedBooks = new Set();

    function saveAddedBooks() {
        try {
            localStorage.setItem(
                "addedBooks",
                JSON.stringify([...addedBooks])
            );
        } catch (error) {
            console.warn(
                "Không thể lưu trạng thái nút thêm sách.",
                error
            );
        }
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

    async function syncAddedBooksWithServer() {
        const response = await fetch("/cart", {
            method: "GET",
            headers: {
                "Accept": "text/html"
            },
            cache: "no-store",
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error("Không thể tải giỏ hàng.");
        }

        const html = await response.text();

        const cartDocument = new DOMParser().parseFromString(
            html,
            "text/html"
        );

        addedBooks.clear();

        cartDocument
            .querySelectorAll('[id^="cart-item-"]')
            .forEach(function (item) {
                const bookId = item.id.substring(
                    "cart-item-".length
                );

                if (bookId) {
                    addedBooks.add(String(bookId));
                }
            });

        saveAddedBooks();

        document.querySelectorAll(
            ".add-to-cart-button"
        ).forEach(function (button) {
            const bookId = button.dataset.bookId;

            if (bookId) {
                setAddButtonState(
                    button,
                    addedBooks.has(String(bookId))
                );
            }
        });
    }

    // Đồng bộ nền, không chặn các chức năng khác.
    syncAddedBooksWithServer().catch(function (error) {
        console.warn("Đồng bộ giỏ hàng thất bại:", error);
    });

    // =====================================
    // 7. THÊM SÁCH VÀO GIỎ HÀNG
    // =====================================

    document.querySelectorAll(
        ".add-to-cart-button"
    ).forEach(function (button) {
        button.addEventListener("click", async function (event) {
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
                    credentials: "same-origin",
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
                    if (response.status === 401) {
                        window.location.href = "/login";
                        return;
                    }

                    throw new Error(
                        result.message ||
                        "Không thể thêm sách vào giỏ hàng."
                    );
                }

                addedBooks.add(String(bookId));
                saveAddedBooks();

                setAddButtonState(button, true);

            } catch (error) {
                alert(
                    error.message ||
                    "Không thể kết nối đến máy chủ."
                );

                setAddButtonState(button, false);

            } finally {
                delete button.dataset.adding;
            }
        });
    });

    // =====================================
    // 8. TÍNH TỔNG TIỀN GIỎ HÀNG
    // =====================================

    function getItemPrice(item, bookId) {
        const totalElement = document.getElementById(
            "item-total-" + bookId
        );

        if (
            totalElement &&
            totalElement.dataset.price !== undefined
        ) {
            return Number(totalElement.dataset.price);
        }

        const priceElement = item.querySelector(
            ".cart-item-price strong"
        );

        if (priceElement) {
            return Number(
                priceElement.textContent.replace(/[^\d]/g, "")
            );
        }

        return 0;
    }

    function recalculateCartTotals() {
        let total = 0;
        let valid = true;

        document.querySelectorAll(
            ".cart-quantity-form"
        ).forEach(function (form) {
            const input = form.querySelector(
                '[name="quantity"]'
            );

            const bookIdInput = form.querySelector(
                '[name="book_id"]'
            );

            if (!input || !bookIdInput) return;

            const quantity = Number(input.value);
            const max = input.max !== ""
                ? Number(input.max)
                : Infinity;

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > max
            ) {
                valid = false;
                return;
            }

            const bookId = String(bookIdInput.value);

            const item = document.getElementById(
                "cart-item-" + bookId
            );

            if (!item) return;

            const price = getItemPrice(item, bookId);
            const subtotal = price * quantity;

            const itemTotal = document.getElementById(
                "item-total-" + bookId
            );

            if (itemTotal) {
                itemTotal.textContent = formatMoney(subtotal);
            }

            // Hỗ trợ cả class .item-total trong giao diện.
            const alternateTotal = item.querySelector(".item-total");

            if (alternateTotal) {
                alternateTotal.textContent =
                    formatMoney(subtotal);
            }

            total += subtotal;
        });

        if (!valid) return;

        const subtotalElement =
            document.getElementById("cart-subtotal");

        const totalElement =
            document.getElementById("cart-total");

        if (subtotalElement) {
            subtotalElement.textContent = formatMoney(total);
        }

        if (totalElement) {
            totalElement.textContent = formatMoney(total);
        }
    }

    document.querySelectorAll(
        ".cart-quantity-form"
    ).forEach(function (form) {
        const input = form.querySelector('[name="quantity"]');

        if (!input) return;

        input.dataset.savedQuantity = input.value;

        input.addEventListener(
            "input",
            recalculateCartTotals
        );

        input.addEventListener(
            "change",
            function () {
                validateQuantity(input);
                recalculateCartTotals();
            }
        );
    });

    // =====================================
    // 9. CẬP NHẬT SỐ LƯỢNG TRÊN MÁY CHỦ
    // =====================================

    document.querySelectorAll(
        ".cart-quantity-form"
    ).forEach(function (form) {
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

            if (!bookIdInput || !quantityInput) return;
            if (form.dataset.submitting === "true") return;

            const quantity = Number(quantityInput.value);
            const max = quantityInput.max !== ""
                ? Number(quantityInput.max)
                : Infinity;

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > max
            ) {
                alert("Vui lòng nhập số lượng hợp lệ.");
                return;
            }

            form.dataset.submitting = "true";

            if (button) button.disabled = true;

            try {
                const result = await postForm(form);

                quantityInput.dataset.savedQuantity =
                    quantityInput.value;

                recalculateCartTotals();

                // Nếu backend trả tồn kho mới, cập nhật giới hạn.
                if (result.stock !== undefined) {
                    quantityInput.max = result.stock;
                }

            } catch (error) {
                quantityInput.value =
                    quantityInput.dataset.savedQuantity || "1";

                recalculateCartTotals();

                alert(error.message || "Cập nhật giỏ hàng thất bại.");

            } finally {
                delete form.dataset.submitting;

                if (button) button.disabled = false;
            }
        });
    });

    // =====================================
    // 10. XÓA SÁCH KHỎI GIỎ HÀNG
    // =====================================

    function showEmptyCart() {
        const cartItems = document.querySelector(".cart-items");

        if (!cartItems) return;

        const emptyCart = document.createElement("div");
        emptyCart.className = "empty-cart";

        const heading = document.createElement("h2");
        heading.textContent = "Giỏ hàng đang trống";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Bạn chưa có sản phẩm nào trong giỏ hàng.";

        const continueLink = document.createElement("a");
        continueLink.href = "/books";
        continueLink.className = "continue-shopping-button";
        continueLink.textContent = "Tiếp tục mua sắm";

        emptyCart.append(heading, paragraph, continueLink);
        cartItems.replaceChildren(emptyCart);

        const subtotal = document.getElementById("cart-subtotal");
        const total = document.getElementById("cart-total");

        if (subtotal) subtotal.textContent = formatMoney(0);
        if (total) total.textContent = formatMoney(0);

        const checkoutButton = document.getElementById(
            "checkout-button"
        );

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        const placeOrderButton = document.getElementById(
            "place-order-button"
        );

        if (placeOrderButton) {
            placeOrderButton.disabled = true;
        }
    }

    document.querySelectorAll(
        ".cart-remove-form"
    ).forEach(function (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const bookIdInput = form.querySelector(
                '[name="book_id"]'
            );

            const button = form.querySelector(
                'button[type="submit"]'
            );

            if (!bookIdInput) return;
            if (form.dataset.submitting === "true") return;

            form.dataset.submitting = "true";

            if (button) button.disabled = true;

            try {
                await postForm(form);

                const bookId = String(bookIdInput.value);

                addedBooks.delete(bookId);
                saveAddedBooks();

                const item = document.getElementById(
                    "cart-item-" + bookId
                );

                if (item) item.remove();

                // Mở lại nút thêm sách tương ứng nếu đang có trên trang.
                document.querySelectorAll(
                    ".add-to-cart-button"
                ).forEach(function (addButton) {
                    if (
                        String(addButton.dataset.bookId) === bookId
                    ) {
                        setAddButtonState(addButton, false);
                    }
                });

                if (
                    !document.querySelector(".cart-quantity-form")
                ) {
                    showEmptyCart();
                } else {
                    recalculateCartTotals();
                }

            } catch (error) {
                alert(error.message || "Xóa sách thất bại.");

            } finally {
                delete form.dataset.submitting;

                if (button) button.disabled = false;
            }
        });
    });

    // =====================================
    // 11. KIỂM TRA ĐĂNG NHẬP KHI THANH TOÁN
    // =====================================

    const checkoutButton =
        document.getElementById("checkout-button");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function (event) {
            const isLoggedIn =
                checkoutButton.dataset.loggedIn === "true";

            if (!isLoggedIn) {
                event.preventDefault();

                window.location.href =
                    checkoutButton.dataset.loginUrl || "/login";
            }
        });
    }

    // =====================================
    // 12. ĐẶT HÀNG — CHỈ MỘT TRÌNH XỬ LÝ
    // =====================================

    // Hỗ trợ cả hai cách đặt tên form đang có trong code cũ.
    const checkoutForm =
        document.querySelector(".checkout-form") ||
        document.getElementById("order-form");

    const orderResult =
        document.getElementById("order-result");

    if (checkoutForm) {
        checkoutForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                if (!checkoutForm.reportValidity()) return;

                if (checkoutForm.dataset.submitting === "true") {
                    return;
                }

                const button = checkoutForm.querySelector(
                    'button[type="submit"]'
                );

                checkoutForm.dataset.submitting = "true";

                if (button) {
                    button.disabled = true;
                    button.textContent = "Đang đặt hàng...";
                }

                if (orderResult) {
                    orderResult.hidden = false;
                    orderResult.textContent =
                        "Đang xử lý đơn hàng...";
                }

                try {
                    const response = await fetch(checkoutForm.action, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(
        Object.fromEntries(new FormData(checkoutForm).entries())
    )
});

const result = await readJsonResponse(response);

if (!response.ok || result.status !== "success") {
    if (response.status === 401) {
        window.location.href = "/login";
        return;
    }

    throw new Error(
        result.message || "Đặt hàng thất bại."
    );
}

                    // Xóa trạng thái giao diện cũ sau khi server xác nhận.
                    addedBooks.clear();
                    saveAddedBooks();

                    if (orderResult) {
                        orderResult.replaceChildren();
                        orderResult.hidden = false;

                        const heading = document.createElement("h3");
                        heading.textContent = "Đặt hàng thành công!";
                        orderResult.appendChild(heading);

                        if (result.order_id !== undefined) {
                            const orderId = document.createElement("p");

                            orderId.textContent =
                                "Mã đơn hàng: #" + result.order_id;

                            orderResult.appendChild(orderId);
                        }

                        const message = document.createElement("p");

                        message.textContent =
                            result.message || "Đơn hàng đã được ghi nhận.";

                        orderResult.appendChild(message);
                    } else {
                        alert(
                            (result.message || "Đặt hàng thành công!") +
                            (
                                result.order_id !== undefined
                                    ? "\nMã đơn hàng: #" + result.order_id
                                    : ""
                            )
                        );
                    }

                    // Nếu đã có trang lịch sử đơn hàng thì chuyển tới đó.
                    window.setTimeout(function () {
                        window.location.href =
                            result.redirect || "/orders";
                    }, 1200);

                } catch (error) {
                    if (orderResult) {
                        orderResult.hidden = false;
                        orderResult.textContent =
                            error.message || "Đặt hàng thất bại.";
                    } else {
                        alert(
                            error.message || "Đặt hàng thất bại."
                        );
                    }

                } finally {
                    delete checkoutForm.dataset.submitting;

                    if (button) {
                        // Chỉ mở lại nút nếu chưa đặt hàng thành công.
                        const successHeading =
                            orderResult?.querySelector("h3");

                        const succeeded =
                            successHeading &&
                            successHeading.textContent ===
                                "Đặt hàng thành công!";

                        if (!succeeded) {
                            button.disabled = false;
                            button.textContent = "Đặt hàng";
                        }
                    }
                }
            }
        );
    }
});
