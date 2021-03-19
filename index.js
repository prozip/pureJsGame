const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

var score = 0
const scoreEle = document.getElementById('score');

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
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
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 20, 'blue')
const projectiles = []
const enemys = []

function spawnEnemies() {
    setInterval(() => {
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
    }, 800)
}

let animateID
function animate() {
    animateID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

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
        if (dist - enemy.radius - player.radius < 0.01) {
            if (player.radius - enemy.radius / 2 < 10) {
                cancelAnimationFrame(animateID)
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

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - player.y,
        event.clientX - player.x)
    const velocity = {
        x: Math.cos(angle) * 2,
        y: Math.sin(angle) * 2
    }

    projectiles.push(new Projectile(
        player.x, player.y, 5, 'red', velocity
    ))
})
window.addEventListener('keydown', function (event) {
    // switch (event.key) {
    //     case 'w':
    //         player.y = player.y - 10
    //         break;
    //     case 'a':
    //         player.x = player.x - 10
    //         break;
    //     case 's':
    //         player.y = player.y + 10
    //         break;
    //     case 'd':
    //         player.x = player.x + 10
    //         break;
    // }
    if (event.key === 'w') {
        player.y = player.y - 10
    }
    if (event.key === 'a') {
        player.x = player.x - 10
    }
    if (event.key === 's') {
        player.y = player.y + 10
    }
    if (event.key === 'd') {
        player.x = player.x + 10
    }
})
animate()
spawnEnemies()