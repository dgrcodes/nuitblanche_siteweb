// ------ ANIMATION TEXTE HERO ------

var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 800;
    }

    setTimeout(function() {
        that.tick();
    }, delta);
};

window.onload = function() {
    var elements = document.getElementsByClassName('typewrite');
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }

    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
};


// ------ TIMER HERO ------

function startCountdown() {
    const target = new Date("2026-05-02T00:00:00");

    const update = () => {
        const diff = target - new Date();

        if (diff <= 0) {
            document.getElementById("countdown").textContent = "C'est aujourd'hui !";
            return;
        }

        const days    = Math.floor(diff / 86400000);
        const hours   = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.getElementById("countdown").textContent =
            `${String(days).padStart(2, "0")}j ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
    };

    update();
    setInterval(update, 1000);
}

startCountdown();


// ------ DÉSACTIVATION DES TRANSITIONS AU REDIMENSIONNEMENT ------

let resizeTimer;
window.addEventListener('resize', function() {
    document.body.classList.add('resize-no-transition');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        document.body.classList.remove('resize-no-transition');
    }, 200);
});


// ------ ANIMATION DES BLOCS HORAIRES AU SCROLL ------

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.time-block').forEach(block => {
    observer.observe(block);
});


// ------ NAVIGATION ACTIVE SELON LA SECTION VISIBLE ------

const navLinks = document.querySelectorAll('.navbar a.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${id}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
}, {
    threshold: 0.4,
    rootMargin: '-80px 0px 0px 0px'
});

sections.forEach(section => {
    navObserver.observe(section);
});