/* ============================================================
   cart.js — LaptopZone
   Giỏ hàng: Thêm / Xóa / Cập nhật số lượng / LocalStorage
   ============================================================ */

/* ── Khởi tạo giỏ hàng từ localStorage ── */
var cart = JSON.parse(localStorage.getItem('lz_cart') || '[]');

/* ── Lưu giỏ hàng vào localStorage ── */
function saveCart() {
    localStorage.setItem('lz_cart', JSON.stringify(cart));
}

/* ── Định dạng tiền VNĐ ── */
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

/* ── Default thumbnail cho sản phẩm không có ảnh ── */
function getDefaultThumb() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect fill="%230d1220" width="80" height="80"/%3E%3Crect fill="%2300f5ff" opacity="0.2" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" font-size="12" fill="%2300f5ff" text-anchor="middle" dy=".3em"%3ELaptop%3C/text%3E%3C/svg%3E';
}

/* ══════════════════════════════════════
   THÊM SẢN PHẨM VÀO GIỎ
   Gọi: addToCart({ id, name, price, img }, qty)
══════════════════════════════════════ */
function addToCart(product, qty) {
    qty = qty || 1;

    var existing = cart.find(function (item) {
        return item.id === product.id;
    });

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            qty: qty
        });
    }

    saveCart();
    renderCart();
    updateCartBadge();
    showCartToast(product.name);

    /* Mở offcanvas giỏ hàng */
    var offcanvasEl = document.getElementById('cartOffcanvas');
    if (offcanvasEl) {
        var offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        offcanvas.show();
    }
}

/* ══════════════════════════════════════
   XÓA SẢN PHẨM KHỎI GIỎ
══════════════════════════════════════ */
function removeFromCart(productId) {
    cart = cart.filter(function (item) {
        return item.id !== productId;
    });
    saveCart();
    renderCart();
    updateCartBadge();
}

/* ══════════════════════════════════════
   CẬP NHẬT SỐ LƯỢNG
══════════════════════════════════════ */
function updateQty(productId, delta) {
    var item = cart.find(function (i) { return i.id === productId; });
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        /* Nếu số lượng = 0 thì xóa luôn */
        removeFromCart(productId);
        return;
    }

    saveCart();
    renderCart();
    updateCartBadge();
}

/* ══════════════════════════════════════
   XÓA TOÀN BỘ GIỎ HÀNG
══════════════════════════════════════ */
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
}

/* ══════════════════════════════════════
   TÍNH TỔNG TIỀN
══════════════════════════════════════ */
function getCartTotal() {
    return cart.reduce(function (sum, item) {
        return sum + item.price * item.qty;
    }, 0);
}

/* ══════════════════════════════════════
   TỔNG SỐ LƯỢNG SẢN PHẨM
══════════════════════════════════════ */
function getCartCount() {
    return cart.reduce(function (sum, item) {
        return sum + item.qty;
    }, 0);
}

/* ══════════════════════════════════════
   CẬP NHẬT BADGE TRÊN ICON GIỎ HÀNG
══════════════════════════════════════ */
function updateCartBadge() {
    var count = getCartCount();
    var $badge = $('#cartCount');
    if ($badge.length) {
        $badge.text(count);
        $badge.addClass('bump');
        setTimeout(function () {
            $badge.removeClass('bump');
        }, 300);
    }
}

/* ══════════════════════════════════════
   RENDER GIỎ HÀNG VÀO OFFCANVAS
══════════════════════════════════════ */
function renderCart() {
    var $empty = $('#cartEmpty');
    var $items = $('#cartItems');
    var $footer = $('#cartFooter');
    var $total = $('#cartTotal');

    if (!$items.length) return;

    $items.empty();

    if (cart.length === 0) {
        if ($empty.length) $empty.show();
        if ($footer.length) $footer.hide();
        return;
    }

    if ($empty.length) $empty.hide();
    if ($footer.length) $footer.show();

    cart.forEach(function (item) {
        var imgSrc = item.img || getDefaultThumb();

        var html = '<div class="cart-item" id="cart-item-' + item.id + '" style="'
            + 'display:flex;gap:14px;padding:14px 0;'
            + 'border-bottom:1px solid rgba(0,245,255,.08);">'
            + '<div style="width:72px;height:72px;border-radius:8px;overflow:hidden;'
            + 'background:#0d1220;flex-shrink:0;border:1px solid rgba(0,245,255,.1);">'
            + '<img src="' + imgSrc + '" alt="' + item.name + '" '
            + 'style="width:100%;height:100%;object-fit:contain;"/>'
            + '</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-family:\'Rajdhani\',sans-serif;font-size:14px;font-weight:700;'
            + 'color:#e8f0fe;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'
            + item.name + '</div>'
            + '<div style="color:#00f5ff;font-family:\'Rajdhani\',sans-serif;font-size:15px;'
            + 'font-weight:700;margin-bottom:8px;">' + formatPrice(item.price) + '</div>'
            + '<div style="display:flex;align-items:center;justify-content:space-between;">'
            + '<div style="display:flex;align-items:center;border:1px solid rgba(0,245,255,.2);'
            + 'border-radius:6px;overflow:hidden;">'
            + '<button onclick="updateQty(' + item.id + ', -1)" '
            + 'style="width:28px;height:28px;background:rgba(0,245,255,.06);border:none;'
            + 'color:#00f5ff;font-size:14px;cursor:pointer;transition:.2s;">−</button>'
            + '<span style="width:32px;text-align:center;font-family:\'Orbitron\',sans-serif;'
            + 'font-size:13px;color:#e8f0fe;">' + item.qty + '</span>'
            + '<button onclick="updateQty(' + item.id + ', 1)" '
            + 'style="width:28px;height:28px;background:rgba(0,245,255,.06);border:none;'
            + 'color:#00f5ff;font-size:14px;cursor:pointer;transition:.2s;">+</button>'
            + '</div>'
            + '<button onclick="removeFromCart(' + item.id + ')" '
            + 'style="background:none;border:none;color:#4a5568;cursor:pointer;font-size:15px;'
            + 'padding:4px;transition:.2s;" title="Xóa sản phẩm">'
            + '<i class="fa-solid fa-trash"></i></button>'
            + '</div>'
            + '</div>'
            + '</div>';

        $items.append(html);
    });

    if ($total.length) {
        $total.text(formatPrice(getCartTotal()));
    }
}

/* ══════════════════════════════════════
   TOAST THÔNG BÁO KHI THÊM GIỎ
══════════════════════════════════════ */
function showCartToast(productName) {
    /* Dùng hàm showToast từ main.js nếu có */
    if (typeof window.showToast === 'function') {
        var shortName = productName.length > 30
            ? productName.substring(0, 30) + '...'
            : productName;
        window.showToast('🛒 Đã thêm: ' + shortName, 'success');
        return;
    }

    /* Fallback toast nếu main.js chưa load */
    var $toast = $('<div>')
        .css({
            position: 'fixed',
            bottom: '90px',
            right: '32px',
            zIndex: 9999,
            background: '#111827',
            border: '1px solid #00ff88',
            borderRadius: '10px',
            padding: '12px 18px',
            color: '#e8f0fe',
            fontSize: '14px',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '600',
            boxShadow: '0 8px 32px rgba(0,0,0,.5)',
            maxWidth: '300px',
            transform: 'translateX(120%)',
            transition: 'transform .3s ease'
        })
        .html('<i class="fa-solid fa-cart-plus me-2" style="color:#00ff88"></i>Đã thêm vào giỏ hàng!');

    $('body').append($toast);
    setTimeout(function () { $toast.css('transform', 'translateX(0)'); }, 10);
    setTimeout(function () {
        $toast.css('transform', 'translateX(120%)');
        setTimeout(function () { $toast.remove(); }, 300);
    }, 2500);
}

/* ══════════════════════════════════════
   KHỞI TẠO KHI TRANG LOAD
══════════════════════════════════════ */
$(function () {

    /* Render giỏ hàng ban đầu */
    renderCart();
    updateCartBadge();

    /* Nút xóa toàn bộ giỏ */
    $(document).on('click', '#clearCartBtn', function () {
        if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
            clearCart();
        }
    });

    /* Hover effect nút tăng/giảm */
    $(document).on('mouseenter', '#cartItems button', function () {
        $(this).css('background', 'rgba(0,245,255,.15)');
    }).on('mouseleave', '#cartItems button', function () {
        $(this).css('background', 'rgba(0,245,255,.06)');
    });

});