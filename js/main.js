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

    /* ── 7.5. ĐĂNG KÝ / ĐĂNG NHẬP LOCALSTORAGE ── */
    function getUsers() {
        return JSON.parse(localStorage.getItem('lz_users') || '[]');
    }

    function saveUsers(users) {
        localStorage.setItem('lz_users', JSON.stringify(users));
    }

    function findUserByEmail(email) {
        return getUsers().find(function (user) {
            return user.email.toLowerCase() === email.toLowerCase();
        });
    }

    function registerUser(user) {
        var users = getUsers();
        users.push(user);
        saveUsers(users);
    }

    function injectRegisterModal() {
        if (!$('#loginModal').length || $('#registerModal').length) return;

        var registerHtml = `
        <div class="modal fade" id="registerModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background:#111827;border:1px solid rgba(0,245,255,.2);border-radius:16px;">
              <div class="modal-header" style="border-bottom:1px solid rgba(0,245,255,.1);padding:24px 28px;">
                <h5 class="modal-title" style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;"><i class="fa-solid fa-user-plus me-2" style="color:#00f5ff;"></i>Đăng Ký</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" style="padding:28px;">
                <form id="registerForm" novalidate>
                  <div class="mb-4"><label style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;display:block;">Họ và tên</label><input type="text" class="form-control" name="registerName" id="registerName" placeholder="Nguyễn Văn A" style="background:rgba(255,255,255,.04);border:1px solid rgba(0,245,255,.15);border-radius:8px;color:#e8f0fe;padding:12px 16px;"/><span id="registerNameErr" style="color:#ff2d78;font-size:12px;margin-top:4px;display:block;"></span></div>
                  <div class="mb-4"><label style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;display:block;">Email</label><input type="email" class="form-control" name="registerEmail" id="registerEmail" placeholder="email@example.com" style="background:rgba(255,255,255,.04);border:1px solid rgba(0,245,255,.15);border-radius:8px;color:#e8f0fe;padding:12px 16px;"/><span id="registerEmailErr" style="color:#ff2d78;font-size:12px;margin-top:4px;display:block;"></span></div>
                  <div class="mb-4"><label style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;display:block;">Mật khẩu</label><input type="password" class="form-control" name="registerPass" id="registerPass" placeholder="Tối thiểu 6 ký tự" style="background:rgba(255,255,255,.04);border:1px solid rgba(0,245,255,.15);border-radius:8px;color:#e8f0fe;padding:12px 16px;"/><span id="registerPassErr" style="color:#ff2d78;font-size:12px;margin-top:4px;display:block;"></span></div>
                  <div class="mb-4"><label style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;display:block;">Xác nhận mật khẩu</label><input type="password" class="form-control" name="registerConfirm" id="registerConfirm" placeholder="Nhập lại mật khẩu" style="background:rgba(255,255,255,.04);border:1px solid rgba(0,245,255,.15);border-radius:8px;color:#e8f0fe;padding:12px 16px;"/><span id="registerConfirmErr" style="color:#ff2d78;font-size:12px;margin-top:4px;display:block;"></span></div>
                  <button type="submit" style="background:#00f5ff;border:none;color:#080b14;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:13px;border-radius:6px;cursor:pointer;width:100%;"><i class="fa-solid fa-user-plus me-2"></i>Đăng Ký</button>
                </form>
                <div class="text-center" style="margin-top:14px;color:#94a3b8;font-size:13px;">
                  Đã có tài khoản? <a href="#" id="openLoginFromRegister" style="color:#00f5ff;text-decoration:none;">Đăng nhập</a>
                </div>
              </div>
            </div>
          </div>
        </div>`;

        $('body').append(registerHtml);
    }

    function appendRegisterLinkToLogin() {
        if (!$('#loginModal').length) return;
        var $form = $('#loginModal').find('#loginForm');
        if (!$form.length || $form.find('#openRegisterModal').length) return;

        var html = '<div class="text-center" style="margin-top:14px;color:#94a3b8;font-size:13px;">Chưa có tài khoản? <a href="#" id="openRegisterModal" style="color:#00f5ff;text-decoration:none;">Đăng ký</a></div>';
        $form.append(html);

        $(document).on('click', '#openRegisterModal', function (e) {
            e.preventDefault();
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
            var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });

        $(document).on('click', '#openLoginFromRegister', function (e) {
            e.preventDefault();
            var registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) registerModal.hide();
            var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }

    injectRegisterModal();
    appendRegisterLinkToLogin();

    if ($('#registerForm').length) {
        $('#registerForm').validate({
            rules: {
                registerName: { required: true, noNumbers: true },
                registerEmail: { required: true, email: true },
                registerPass: { required: true, minlength: 6 },
                registerConfirm: { required: true, equalTo: '#registerPass' }
            },
            messages: {
                registerName: { required: 'Vui lòng nhập họ tên', noNumbers: 'Tên không được chứa số' },
                registerEmail: { required: 'Vui lòng nhập email', email: 'Email không hợp lệ' },
                registerPass: { required: 'Vui lòng nhập mật khẩu', minlength: 'Mật khẩu tối thiểu 6 ký tự' },
                registerConfirm: { required: 'Vui lòng xác nhận mật khẩu', equalTo: 'Mật khẩu không khớp' }
            },
            errorPlacement: function (error, element) {
                var map = {
                    registerName: '#registerNameErr',
                    registerEmail: '#registerEmailErr',
                    registerPass: '#registerPassErr',
                    registerConfirm: '#registerConfirmErr'
                };
                var id = element.attr('id');
                if (map[id]) { error.appendTo(map[id]); }
                else { error.insertAfter(element); }
            },
            highlight: function (el) { $(el).css('border-color', '#ff2d78'); },
            unhighlight: function (el) { $(el).css('border-color', 'rgba(0,245,255,.15)'); },
            submitHandler: function () {
                var name = $.trim($('#registerName').val());
                var email = $.trim($('#registerEmail').val()).toLowerCase();
                var password = $('#registerPass').val();

                if (findUserByEmail(email)) {
                    $('#registerEmailErr').text('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
                    return;
                }

                registerUser({ name: name, email: email, password: password });
                localStorage.setItem('lz_user', JSON.stringify({ email: email, name: name, loggedIn: true }));
                var modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (modal) modal.hide();
                updateLoginUI();
                showToast('🎉 Đăng ký thành công! Xin chào ' + name + '.', 'success');
                $('#registerForm')[0].reset();
            }
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
                var email = $.trim($('#loginEmail').val()).toLowerCase();
                var password = $('#loginPass').val();
                var user = findUserByEmail(email);

                if (!user) {
                    $('#loginEmailErr').text('Email chưa được đăng ký. Vui lòng đăng ký trước.');
                    return;
                }
                if (user.password !== password) {
                    $('#loginPassErr').text('Mật khẩu không chính xác. Vui lòng thử lại.');
                    return;
                }

                localStorage.setItem('lz_user', JSON.stringify({ email: user.email, name: user.name, loggedIn: true }));
                var modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) modal.hide();
                updateLoginUI();
                showToast('👋 Xin chào ' + user.name + '! Đăng nhập thành công.', 'success');
                $('#loginEmailErr, #loginPassErr').empty();
                $('#loginForm')[0].reset();
            }
        });
    }

    /* ── 9. CẬP NHẬT UI SAU ĐĂNG NHẬP ── */
    function updateLoginUI() {
        var user = JSON.parse(localStorage.getItem('lz_user') || 'null');
        if (user && user.loggedIn) {
            var name = user.name || user.email.split('@')[0];
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