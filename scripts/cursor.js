const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    follower.style.left = e.clientX + 'px';
    follower.style.top = e.clientY + 'px';
});

// Hover sur éléments interactifs
document.querySelectorAll('a, button, [onclick]').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
        follower.style.width = '60px';
        follower.style.height = '60px';
        follower.style.borderColor = 'rgba(187, 222, 233, 1)';
    });
    el.addEventListener('mouseleave', function() {
        follower.style.width = '36px';
        follower.style.height = '36px';
        follower.style.borderColor = 'rgba(187, 222, 233, 0.6)';
    });
});

// Click
const clickColors = [
  '#e5806c',
  '#b1e8c9',
  '#f4a261',
  '#2a9d8f',
  '#e9c46a',
];
let colorIndex = 0;

document.addEventListener('mousedown', function() {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    follower.style.width = '50px';
    follower.style.height = '50px';
});

document.addEventListener('mouseup', function() {
    colorIndex++;
    const color = clickColors[colorIndex % clickColors.length];
    cursor.style.backgroundColor = color;
    follower.style.borderColor = color;
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    follower.style.width = '36px';
    follower.style.height = '36px';
});