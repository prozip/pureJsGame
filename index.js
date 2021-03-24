const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

var score = 0
const scoreEle = document.getElementById('score');

projectileX = 0
projectileY = 0

var joy3Param = { "title": "joystick3" };
var Joy3 = new JoyStick('joy3Div', joy3Param);

var joy5Param = { "title": "joystick5" };
var Joy5 = new JoyStick('joy5Div', joy5Param);

const btnObject = {
    x: 0,
    y: 0
}

class Player {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    drawBorder() {
        let angle = (score % 500) * Math.PI * 2 / 500
        c.beginPath()
        c.arc(this.x, this.y, this.radius - this.radius / 13, 0, angle)
        c.strokeStyle = "red"
        c.lineWidth = this.radius / 6
        c.stroke()
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        this.drawBorder()
    }
    update() {
        this.draw()
        this.x += this.velocity.x * btnObject.x
        this.y += this.velocity.y * btnObject.y
    }

}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    drawBorder() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.strokeStyle = this.color
        c.stroke()
    }
    update() {
        this.draw()
        this.drawBorder()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 20, 'blue', {
    x: 3, y: 3
})
const projectiles = []
const enemys = []

function getEnemy() {
    let ene = 1000 - Math.round(score / 2)
    if (ene < 150) {
        ene = 150
    }
    console.log(ene)
    return ene
}

function spawnEnemies() {
    setTimeout(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x; let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() * 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(player.y - y,
            player.x - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemys.push(new Enemy(x, y, radius, color, velocity, true))
        spawnEnemies()
    }, getEnemy());
}

let animateID
function animate() {
    animateID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    projectiles.forEach((projectile, index) => {
        projectile.update()
        // remove from edge of screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0);
        }
    })
    enemys.forEach((enemy, eIndex) => {
        enemy.update()

        //enemy touch player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius + 0.5 < 0.01) {
            if (player.radius - enemy.radius / 2 < 10) {
                cancelAnimationFrame(animateID)
                var modal = document.getElementById('popup')
                var scorePopup = document.getElementById('popupScore')
                modal.style.display = "block"
                scorePopup.innerHTML = "Score: " + Math.round(score)
            } else {
                gsap.to(player, {
                    radius: player.radius - Math.round(enemy.radius / 2)
                })
                setTimeout(() => {
                    enemys.splice(eIndex, 1)
                }, 0);
            }
        }



        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // projectile touch enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                score += enemy.radius
                scoreEle.innerHTML = Math.round(score)
                if (enemy.radius - 10 > 10) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    gsap.to(player, {
                        radius: player.radius + 1.25
                    })
                    setTimeout(() => {
                        projectiles.splice(pIndex, 1)
                    }, 0);
                } else {
                    player.radius += Math.round(enemy.radius / 8)
                    setTimeout(() => {
                        enemys.splice(eIndex, 1)
                        projectiles.splice(pIndex, 1)
                    }, 0);
                }
            }
        })
    })
}

function playShotSound() {
    var audio = document.getElementById("projectileAudio");
    audio.pause();
    audio.currentTime = 0;
    audio.play();
}

window.addEventListener('click', (event) => {
    playShotSound()
    const angle = Math.atan2(event.clientY - player.y,
        event.clientX - player.x)
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    projectiles.push(new Projectile(
        player.x, player.y, 5 + player.radius / 15, 'red', velocity
    ))
})

// player move with keyboard
window.addEventListener('keydown', function (event) {
    if (event.key == 'w' && btnObject.y != -1) {
        btnObject.y -= 1
    }
    if (event.key == 'a' && btnObject.x != -1) {
        btnObject.x -= 1
    }
    if (event.key == 's' && btnObject.y != 1) {
        btnObject.y += 1
    }
    if (event.key == 'd' && btnObject.x != 1) {
        btnObject.x += 1
    }
    console.log(btnObject)
})
window.addEventListener('keyup', function (event) {
    if (event.key == 'w') {
        btnObject.y += 1
    }
    if (event.key == 'a') {
        btnObject.x += 1
    }
    if (event.key == 's') {
        btnObject.y -= 1
    }
    if (event.key == 'd') {
        btnObject.x -= 1
    }
})


// player move with joystick
setInterval(function () {
    let newX = player.x + parseInt(Joy3.GetX()) / 4
    let newY = player.y - parseInt(Joy3.GetY()) / 4
    if (newX < player.radius) {
        newX = player.radius
    } else if (newX > canvas.width) {
        newX = canvas.width - player.radius
    }
    if (newY < player.radius) {
        newY = player.radius
    } else if (newY > canvas.height) {
        newY = canvas.height - player.radius
    }
    // player.x = newX; player.y = newY
    gsap.to(player, {
        x: newX,
        y: newY
    })
}, 50)

// projectile joystick
setInterval(function () {
    let x = Joy5.GetX()
    let y = Joy5.GetY() * -1

    if (x != 0 && y != 0) {
        playShotSound()
        let angle = Math.atan2(y, x)
        let velocity = {
            x: Math.cos(angle) * 4,
            y: Math.sin(angle) * 4
        }
        projectiles.push(new Projectile(
            player.x, player.y, 5 + player.radius / 15, 'red', velocity
        ))
    }
}, 180);
animate()
spawnEnemies()