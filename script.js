document.addEventListener('DOMContentLoaded', () => {

    /* ===================================================
       1. ABSOLUTE WEDDING TIMESTAMP & LOCAL TIME CONVERSION
       Wedding Time in Vietnam: 2026-11-28 18:00:00 (UTC+7)
    =================================================== */
    const weddingVietnamIso = '2026-11-28T18:00:00+07:00';
    const weddingTimestamp = new Date(weddingVietnamIso).getTime();

    // Format local time based on visitor's device time zone
    const visitorLocale = navigator.language || 'vi-VN';
    const visitorTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    
    const weddingDateObj = new Date(weddingTimestamp);

    try {
        const localTimeFormatted = weddingDateObj.toLocaleString(visitorLocale, {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const localDisplayElem = document.getElementById('guestLocalTimeDisplay');
        const timezoneNameElem = document.getElementById('guestTimezoneName');
        const userTzNoticeElem = document.getElementById('userTimezoneInfo');

        if (localDisplayElem) {
            localDisplayElem.innerText = localTimeFormatted;
        }
        if (timezoneNameElem) {
            timezoneNameElem.innerText = `Tự động phát hiện múi giờ: ${visitorTimeZone}`;
        }
        if (userTzNoticeElem) {
            userTzNoticeElem.innerText = `Tự động đồng bộ theo múi giờ thiết bị của bạn (${visitorTimeZone})`;
        }
    } catch (e) {
        console.error("Timezone formatting error:", e);
    }

    /* ===================================================
       2. COUNTDOWN TIMER
    =================================================== */
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingTimestamp - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const daysElem = document.getElementById('days');
            const hoursElem = document.getElementById('hours');
            const minElem = document.getElementById('minutes');
            const secElem = document.getElementById('seconds');

            if (daysElem) daysElem.innerText = String(days).padStart(2, '0');
            if (hoursElem) hoursElem.innerText = String(hours).padStart(2, '0');
            if (minElem) minElem.innerText = String(minutes).padStart(2, '0');
            if (secElem) secElem.innerText = String(seconds).padStart(2, '0');
        } else {
            const container = document.getElementById('countdown');
            if (container) {
                container.innerHTML = "<div style='width:100%; color:var(--accent-gold); font-weight:600; font-size:16px;'>Lễ Cưới Đang Diễn Ra! / Happy Wedding Day!</div>";
            }
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* ===================================================
       3. INTERACTIVE MUSIC PLAYER
    =================================================== */
    const musicBtn = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
                isPlaying = false;
            } else {
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    isPlaying = true;
                }).catch(err => {
                    console.log("Audio play blocked by browser policy:", err);
                });
            }
        });
    }

    /* ===================================================
       4. SCROLL ANIMATION (INTERSECTION OBSERVER)
    =================================================== */
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = { threshold: 0.15 };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    /* ===================================================
       5. INTERACTIVE WISH BOARD & AUTO-FIT TEXTAREA
    =================================================== */
    const sendBtn = document.getElementById('sendWishBtn');
    const wishesDisplay = document.getElementById('wishesDisplay');
    const messageInput = document.getElementById('wishMessage');

    // Tự động co giãn chiều cao của Textarea theo nội dung nhập
    if (messageInput) {
        messageInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    if (sendBtn && wishesDisplay) {
        sendBtn.addEventListener('click', async () => {
            const senderInput = document.getElementById('wishSender');
            const sender = senderInput.value.trim() || 'Người Mới Gửi';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!message) {
                alert('Vui lòng nhập nội dung lời chúc!');
                return;
            }

            // Trạng thái đang gửi (Disable nút bấm)
            sendBtn.disabled = true;
            const originalBtnHTML = sendBtn.innerHTML;
            sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang gửi...</span>';

            try {
                // Gửi dữ liệu về nghia.chupanh@gmail.com bằng API FormSubmit
                const response = await fetch("https://formsubmit.co/ajax/nghiachupanh@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        _subject: `[Thiệp Cưới] Lời chúc mới từ: ${sender}`,
                        _template: "table",
                        Nguoi_Gui: sender,
                        Loi_Chuc: message
                    })
                });

                if (response.ok) {
                    // Thêm lời chúc vào giao diện trang web
                    const wishCard = document.createElement('div');
                    wishCard.className = 'wish-card';
                    wishCard.innerHTML = `
                        <div class="wish-author">❤️ ${escapeHtml(sender)}</div>
                        <div class="wish-text">${escapeHtml(message)}</div>
                    `;

                    wishesDisplay.prepend(wishCard);

                    // Reset form và trả chiều cao khung về mặc định
                    senderInput.value = '';
                    messageInput.value = '';
                    messageInput.style.height = 'auto';

                    // Hiệu ứng bùng nổ trái tim
                    createBurstEffect();
                    alert('Cảm ơn bạn! Lời chúc đã được gửi thành công đến Bảo Khánh & Như Thảo.');
                } else {
                    alert('Gửi lời chúc không thành công. Vui lòng thử lại sau!');
                }
            } catch (error) {
                console.error('Lỗi khi gửi email:', error);
                alert('Có lỗi xảy ra khi gửi. Vui lòng kiểm tra kết nối mạng!');
            } finally {
                // Khôi phục trạng thái nút bấm
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalBtnHTML;
            }
        });
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }

    /* ===================================================
       6. ENHANCED PETALS & CLICK PARTICLES CANVAS
    =================================================== */
    const canvas = document.getElementById('petalCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const petals = [];
    const particles = [];
    const petalCount = 35;

    class Petal {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 1.2 + 0.6;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.angle = Math.random() * 360;
            this.spin = Math.random() * 1.4 - 0.7;
            this.opacity = Math.random() * 0.5 + 0.4;
            const colors = ['#F4B0B7', '#FCE4E6', '#E8B4B8', '#D8A7B1'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.angle * Math.PI / 180) * 0.7 + this.speedX;
            this.angle += this.spin;

            if (this.y > canvas.height + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.angle * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;

            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
            ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
            ctx.fill();

            ctx.restore();
        }
    }

    class HeartParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 12 + 10;
            this.speedY = -(Math.random() * 2 + 1.5);
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.opacity = 1;
            this.color = '#E8B4B8';
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.opacity -= 0.02;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px sans-serif`;
            ctx.fillText('♥', 0, 0);
            ctx.restore();
        }
    }

    window.addEventListener('click', (e) => {
        for (let i = 0; i < 4; i++) {
            particles.push(new HeartParticle(e.clientX, e.clientY));
        }
    });

    function createBurstEffect() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        for (let i = 0; i < 20; i++) {
            particles.push(new HeartParticle(cx, cy));
        }
    }

    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});