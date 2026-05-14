/* ============================================================
   main.js — LaptopZone
   Validation + Modal + Navbar + UI effects
   ============================================================ */

$(function () {

    /* ── 1. NĂM FOOTER ── */
    $('#footerYear, #footerYear2, #yr').text(new Date().getFullYear());

    /* ── 2. NAVBAR SCROLL ── */
    $(window).on('scroll', function () {
        var scrolled = $(this).scrollTop() > 60;
        $('#mainNavbar').toggleClass('scrolled', scrolled);
        $('#backToTop').css({ opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? 'auto' : 'none', transform: scrolled ? 'translateY(0)' : 'translateY(12px)' });
    });

    /* ── 3. BACK TO TOP ── */
    $('#backToTop').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    /* ── 4. COUNTER ANIMATION ── */
    function animateCounter() {
        $('.counter').each(function () {
            var $el = $(this);
            if ($el.data('animated')) return;
            var target = parseInt($el.data('target'));
            var duration = 1500;
            var step = target / (duration / 16);
            var current = 0;
            $el.data('animated', true);
            var timer = setInterval(function () {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                $el.text(Math.floor(current).toLocaleString('vi-VN') + (target >= 100 ? '+' : ''));
            }, 16);
        });
    }

    /* Trigger counter khi scroll tới */
    $(window).on('scroll', function () {
        $('.counter').each(function () {
            var top = $(this).offset().top;
            if ($(window).scrollTop() + $(window).height() > top + 50) {
                animateCounter();
            }
        });
    });

    /* ── 5. CONTACT FORM VALIDATION ── */
    if ($('#contactForm').length) {
        /* Custom rule: tên không chứa số */
        $.validator.addMethod('noNumbers', function (value) {
            return /^[^0-9]+$/.test(value);
        }, 'Tên không được chứa số');

        $('#contactForm').validate({
            rules: {
                contactName: { required: true, noNumbers: true },
                contactEmail: { required: true, email: true },
                contactMsg: { required: true, minlength: 20 }
            },
            messages: {
                contactName: {
                    required: 'Vui lòng nhập họ tên',
                    noNumbers: 'Tên không được chứa ký tự số'
                },
                contactEmail: {
                    required: 'Vui lòng nhập email',
                    email: 'Email không đúng định dạng (vd: abc@gmail.com)'
                },
                contactMsg: {
                    required: 'Vui lòng nhập nội dung',
                    minlength: 'Nội dung tối thiểu 20 ký tự'
                }
            },
            /* Hiện lỗi vào span tương ứng */
            errorPlacement: function (error, element) {
                var id = element.attr('id');
                var map = { contactName: '#errName', contactEmail: '#errEmail', contactMsg: '#errMsg' };
                if (map[id]) { error.appendTo(map[id]); }
                else { error.insertAfter(element); }
            },
            highlight: function (el) {
                $(el).css('border-color', '#ff2d78');
            },
            unhighlight: function (el) {
                $(el).css('border-color', 'rgba(0,245,255,.15)');
            },
            submitHandler: function (form) {
                /* Hiện thông báo thành công */
                showToast('✅ Gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.', 'success');
                $(form).trigger('reset');
                $('#errName, #errEmail, #errMsg').empty();
            }
        });
    }

    /* ── 6. MODAL SERVICE — AUTO-CHECK CHECKBOX ── */
    /* Khi click nút pricing → mở modal + tự tick checkbox tương ứng */
    $(document).on('click', '.btn-pricing', function () {
        var service = $(this).data('service'); // "basic" | "pro" | "premium"
        /* Reset tất cả trước */
        $('input[name="services[]"]').prop('checked', false);
        /* Tick checkbox tương ứng */
        $('#chk-' + service).prop('checked', true);
    });

    /* Khi click nút sidebar/CTA với data-service */
    $(document).on('click', '[data-bs-target="#modalService"][data-service]', function () {
        var service = $(this).data('service');
        if (service) {
            setTimeout(function () {
                $('input[name="services[]"]').prop('checked', false);
                $('#chk-' + service).prop('checked', true);
            }, 300);
        }
    });

    /* ── 7. MODAL SERVICE VALIDATION ── */
    /* Custom rule: phải chọn ít nhất 1 checkbox */
    $.validator.addMethod('minOneChecked', function () {
        return $('input[name="services[]"]:checked').length > 0;
    }, 'Vui lòng chọn ít nhất 1 dịch vụ');

    /* Gán rule cho checkbox đầu tiên */
    if ($('#modalServiceForm').length) {
        $('#modalServiceForm').validate({
            rules: {
                modalName: { required: true },
                modalPhone: { required: true },
                modalEmail: { required: true, email: true },
                'services[]': { minOneChecked: true }
            },
            messages: {
                modalName: { required: 'Vui lòng nhập họ tên' },
                modalPhone: { required: 'Vui lòng nhập số điện thoại' },
                modalEmail: { required: 'Vui lòng nhập email', email: 'Email không hợp lệ' }
            },
            errorPlacement: function (error, element) {
                var name = element.attr('name');
                var map = {
                    modalName: '#errModalName',
                    modalPhone: '#errModalPhone',
                    modalEmail: '#errModalEmail',
                    'services[]': '#errModalService'
                };
                if (map[name]) { error.appendTo(map[name]); }
                else { error.insertAfter(element); }
            },
            highlight: function (el) { $(el).css('border-color', '#ff2d78'); },
            unhighlight: function (el) { $(el).css('border-color', 'rgba(0,245,255,.15)'); },
            submitHandler: function () {
                /* Đóng modal, hiện toast */
                var modal = bootstrap.Modal.getInstance(document.getElementById('modalService'));
                if (modal) modal.hide();
                showToast('🎉 Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.', 'success');
                $('#modalServiceForm').trigger('reset');
                $('#errModalName,#errModalPhone,#errModalEmail,#errModalService').empty();
            }
        });

        /* Trigger submit khi click nút Gửi */
        $('#btnSubmitModal').on('click', function () {
            $('#modalServiceForm').submit();
        });
    }

    /* ── 8. LOGIN FORM VALIDATION ── */
    if ($('#loginForm').length) {
        $('#loginForm').validate({
            rules: {
                loginEmail: { required: true, email: true },
                loginPass: { required: true, minlength: 6 }
            },
            messages: {
                loginEmail: { required: 'Vui lòng nhập email', email: 'Email không đúng định dạng' },
                loginPass: { required: 'Vui lòng nhập mật khẩu', minlength: 'Mật khẩu tối thiểu 6 ký tự' }
            },
            errorPlacement: function (error, element) {
                var map = { loginEmail: '#loginEmailErr', loginPass: '#loginPassErr' };
                var id = element.attr('id');
                if (map[id]) { error.appendTo(map[id]); }
            },
            submitHandler: function () {
                var email = $('#loginEmail').val();
                localStorage.setItem('lz_user', JSON.stringify({ email: email, loggedIn: true }));
                var modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) modal.hide();
                updateLoginUI();
                showToast('👋 Xin chào ' + email.split('@')[0] + '! Đăng nhập thành công.', 'success');
            }
        });
    }

    /* ── 9. CẬP NHẬT UI SAU ĐĂNG NHẬP ── */
    function updateLoginUI() {
        var user = JSON.parse(localStorage.getItem('lz_user') || 'null');
        if (user && user.loggedIn) {
            var name = user.email.split('@')[0];
            $('[data-bs-target="#loginModal"]')
                .html('<i class="fa-solid fa-user-check me-1"></i>' + name)
                .off('click')
                .on('click', function (e) {
                    e.preventDefault();
                    if (confirm('Bạn muốn đăng xuất?')) {
                        localStorage.removeItem('lz_user');
                        location.reload();
                    }
                })
                .removeAttr('data-bs-toggle data-bs-target');
        }
    }
    updateLoginUI();

    /* ── 10. PRODUCT CARD HOVER EFFECTS ── */
    $(document).on('mouseenter', '.product-card', function () {
        $(this).find('img').css('transform', 'scale(1.08)');
    }).on('mouseleave', '.product-card', function () {
        $(this).find('img').css('transform', 'scale(1)');
    });

    /* ── 11. SERVICE CARD HOVER ── */
    $(document).on('mouseenter', '.service-card', function () {
        $(this).css({ 'border-color': 'rgba(0,245,255,.35)', 'transform': 'translateY(-8px)', 'background': '#16202f' });
    }).on('mouseleave', '.service-card', function () {
        $(this).css({ 'border-color': 'rgba(0,245,255,.15)', 'transform': 'translateY(0)', 'background': '#111827' });
    });

    /* ── 12. TOAST NOTIFICATION ── */
    function showToast(message, type) {
        var color = type === 'success' ? '#00ff88' : '#ff2d78';
        var $toast = $('<div>')
            .css({
                position: 'fixed', bottom: '90px', right: '32px', zIndex: 9999,
                background: '#111827', border: '1px solid ' + color,
                borderRadius: '10px', padding: '14px 20px',
                color: '#e8f0fe', fontSize: '14px', fontFamily: "'Rajdhani', sans-serif",
                fontWeight: '600', letterSpacing: '0.5px',
                boxShadow: '0 8px 32px rgba(0,0,0,.5), 0 0 20px ' + color + '33',
                maxWidth: '320px', lineHeight: '1.5',
                transform: 'translateX(120%)', transition: 'transform .3s ease',
                display: 'flex', alignItems: 'center', gap: '10px'
            })
            .text(message);

        $('body').append($toast);
        setTimeout(function () { $toast.css('transform', 'translateX(0)'); }, 10);
        setTimeout(function () {
            $toast.css('transform', 'translateX(120%)');
            setTimeout(function () { $toast.remove(); }, 300);
        }, 3500);
    }

    /* Expose showToast globally */
    window.showToast = showToast;

    /* ── 13. SMOOTH SCROLL cho anchor links ── */
    $('a[href^="#"]').on('click', function (e) {
        var target = $(this).attr('href');
        if (target.length > 1 && $(target).length) {
            e.preventDefault();
            var offset = $(target).offset().top - 80;
            $('html, body').animate({ scrollTop: offset }, 600);
        }
    });

    /* ── 14. DROPDOWN HOVER EFFECT ── */
    $('.dropdown-item').on('mouseenter', function () {
        $(this).css({ 'background': 'rgba(0,245,255,.06)', 'color': '#00f5ff', 'paddingLeft': '24px' });
    }).on('mouseleave', function () {
        $(this).css({ 'background': '', 'color': '#94a3b8', 'paddingLeft': '' });
    });

}); /* end $(function) */