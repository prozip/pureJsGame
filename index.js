const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

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
    constructor(x, y, radius, color, velocity, active) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.active = active
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
        if (Math.abs(canvas.width / 2 - this.x) < 0.5 && Math.abs(canvas.height / 2 - this.y) < 0.5) {
            this.active = false
        }
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 30, 'blue')
const projectiles = []
const enemys = []

const projectile = new Projectile(
    canvas.width / 2, canvas.height / 2, 5, 'red', { x: 1, y: 1 }
)

function spawnEnemies() {
    setInterval(() => {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = 20
        const color = 'green'
        const angle = Math.atan2(canvas.height / 2 - y,
            canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemys.push(new Enemy(x, y, radius, color, velocity, true))
    }, 1000)
}

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    projectiles.forEach((projectile) => {
        projectile.update()
    })
    enemys.forEach((enemy) => {
        if (enemy.active === true) {
            enemy.update()
        }
    })
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

    projectiles.push(new Projectile(
        canvas.width / 2, canvas.height / 2, 5, 'red', velocity
    ))
})

animate()
spawnEnemies()