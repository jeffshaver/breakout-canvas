const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const FPS = 60
const BALL_RADIUS = 10
const BLOCK_HEIGHT = 15
const BLOCK_WIDTH = 100
const BLOCK_MARGIN = 10
const MARGIN = 20

let ballX = canvas.width / 2
let ballY = canvas.height / 2
let blocks = []
let playerX = canvas.width / 2
let velocityX = 2
let velocityY = 4

document.addEventListener('mousemove', event => {
  const { x } = calculateMousePosition(event)

  playerX = x - BLOCK_WIDTH / 2
})

generateInitialBlocks()

setInterval(() => {
  move()
  draw()
}, 1000 / FPS)

function draw() {
  drawBackground()

  drawPlayer()

  drawBlocks()

  drawBall()
}

function drawBackground() {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function drawPlayer() {
  context.fillStyle = 'white'
  context.fillRect(
    playerX,
    canvas.height - (BLOCK_HEIGHT + MARGIN),
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  )
}

function drawBlocks() {
  context.fillStyle = 'white'

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    context.fillRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT)
  }
}

function drawBall() {
  context.fillStyle = 'white'
  context.beginPath()
  context.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2, false)
  context.closePath()
  context.fill()
}

function move() {
  ballX += velocityX
  ballY += velocityY

  if (ballX > canvas.width || ballX < 0) {
    velocityX = -velocityX
  }

  const collidedWithPlayer = checkPlayerCollision()

  if (collidedWithPlayer) {
    let deltaY = ballX + BALL_RADIUS - (playerX + BLOCK_WIDTH / 2)

    velocityX = -velocityX
    velocityY = deltaY * 0.35
  }

  const collidedWithBlock = checkBlockCollision()

  if (collidedWithBlock !== -1) {
    blocks.splice(collidedWithBlock, 1)
    velocityY = -velocityY
  }
}

function generateInitialBlocks() {
  const blockWidth = BLOCK_WIDTH + BLOCK_MARGIN
  const numberOfBlocks = 7
  const numberOfRows = 4
  const margin =
    (canvas.width - (blockWidth * numberOfBlocks - BLOCK_MARGIN)) / 2

  for (let y = 0; y < numberOfRows; y++) {
    for (let x = 0; x < numberOfBlocks; x++) {
      blocks.push({
        x: x * blockWidth + margin,
        y: BLOCK_HEIGHT * y + MARGIN * y + MARGIN
      })
    }
  }
}

function calculateMousePosition(event) {
  const rect = canvas.getBoundingClientRect()
  const root = document.documentElement
  const x = event.clientX - rect.left - root.scrollLeft
  const y = event.clientY - rect.top - root.scrollTop

  return { x, y }
}

function checkPlayerCollision() {
  return (
    ballX <= playerX + BLOCK_WIDTH + BALL_RADIUS &&
    ballX >= playerX - BALL_RADIUS &&
    ballY + BALL_RADIUS >= canvas.height - (MARGIN + BLOCK_HEIGHT)
  )
}

function checkBlockCollision() {
  const b = blocks.findIndex(block => {
    console.log(ballX - BALL_RADIUS, block.x)
    return (
      ballX <= block.x + BLOCK_WIDTH + BALL_RADIUS &&
      ballX >= block.x - BALL_RADIUS &&
      ballY - BALL_RADIUS <= block.y + BLOCK_HEIGHT / 2
    )
  })

  return b
}
