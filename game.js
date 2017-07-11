const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const FPS = 60
const BALL_RADIUS = 10
const BLOCK_HEIGHT = 15
const BLOCK_WIDTH = 100
const BLOCK_MARGIN = 10
const MARGIN = 20
const DAMPENER = 0.25
const MAX_X_VELOCITY = 12
const MIN_X_VELOCITY = 2
const BACKGROUND_COLOR = '#2b2b2b'
const FOREGROUND_COLOR = '#35ac9d'

let ballX = canvas.width / 2
let ballY = canvas.height / 2
let blocks = []
let blockExplosions = []
let playerX = canvas.width / 2
let velocityX = 2
let velocityY = 4
let lives = 3
let paused = false

document.addEventListener('mousemove', event => {
  const { x } = calculateMousePosition(event)

  playerX = x - BLOCK_WIDTH / 2
})

canvas.addEventListener('click', _ => {
  if (lives === 0) {
    lives = 3
    generateInitialBlocks()
  }

  paused = !paused
})

generateInitialBlocks()

setInterval(() => {
  move()
  draw()
}, 1000 / FPS)

function draw() {
  drawBackground()

  if (paused) {
    drawPausedScreen()

    return
  }

  drawLives()

  drawPlayer()

  drawBlocks()

  drawBlockExplosions()

  drawBall()
}

function drawBackground() {
  context.save()
  context.fillStyle = BACKGROUND_COLOR
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.restore()
}

function drawLives() {
  context.save()
  context.fillStyle = FOREGROUND_COLOR
  context.fillText('Lives: ' + lives, 20, 12.5)
  context.restore()
}

function drawPausedScreen() {
  context.save()
  context.fillStyle = FOREGROUND_COLOR
  context.textAlign = 'center'

  if (lives !== 0 && blocks.length !== 0) {
    context.fillText('Click to resume', canvas.width / 2, canvas.height / 2)

    return
  }

  context.fillText(
    'Player Lost; Click to restart',
    canvas.width / 2,
    canvas.height / 2
  )
  context.restore()
}

function drawPlayer() {
  context.save()
  context.fillStyle = FOREGROUND_COLOR
  context.fillRect(
    playerX,
    canvas.height - (BLOCK_HEIGHT + MARGIN),
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  )
  context.restore()
}

function drawBlocks() {
  context.save()
  context.fillStyle = FOREGROUND_COLOR

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    context.fillRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT)
  }
  context.restore()
}

function drawBlockExplosions() {
  context.save()
  for (let i = 0; i < blockExplosions.length; i++) {
    const blockExplosion = blockExplosions[i]

    if (blockExplosion.draws === 0) {
      blockExplosions.splice(i, 1)
    }

    const opacity = blockExplosion.draws / 10

    context.fillStyle = `rgba(53, 172, 157, ${opacity})`

    context.fillRect(
      blockExplosion.x,
      blockExplosion.y,
      BLOCK_WIDTH,
      BLOCK_HEIGHT
    )

    blockExplosion.draws--
  }
  context.restore()
}

function drawBall() {
  context.save()
  context.fillStyle = FOREGROUND_COLOR
  context.beginPath()
  context.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2, false)
  context.closePath()
  context.fill()
  context.restore()
}

function move() {
  if (paused) {
    return
  }

  ballX += velocityX
  ballY += velocityY

  if (
    (ballX > canvas.width && Math.sign(velocityX) === 1) ||
    (ballX < 0 && Math.sign(velocityX) === -1)
  ) {
    velocityX = -velocityX
  }

  const collidedWithTopEdge = checkTopEdgeCollision()

  if (collidedWithTopEdge) {
    velocityY = -velocityY
  }

  const collidedWithBottomEdge = checkBottomEdgeCollision()

  if (collidedWithBottomEdge) {
    lives = lives - 1

    resetBall()
  }

  const collidedWithPlayer = checkPlayerCollision()

  if (collidedWithPlayer) {
    const deltaX = ballX + BALL_RADIUS - (playerX + BLOCK_WIDTH / 2)

    velocityX = deltaX * DAMPENER
    velocityY = -velocityY

    enforceXVelocity()
  }

  const collidedWithBlock = checkBlockCollision()
  const velocityYSign = checkBlockCollisionLocation(blocks[collidedWithBlock])

  if (collidedWithBlock !== -1) {
    const deltaX =
      ballX + BALL_RADIUS - (blocks[collidedWithBlock].x + BLOCK_WIDTH / 2)

    const b = blocks.splice(collidedWithBlock, 1)[0]

    b.draws = 10

    blockExplosions.push(b)

    velocityX = deltaX * DAMPENER
    velocityY = velocityYSign * Math.abs(velocityY)

    enforceXVelocity()
  }
}

function generateInitialBlocks() {
  const blockWidth = BLOCK_WIDTH + BLOCK_MARGIN
  const numberOfBlocks = 7
  const numberOfRows = 4
  const margin =
    (canvas.width - (blockWidth * numberOfBlocks - BLOCK_MARGIN)) / 2

  blocks = []

  for (let y = 0; y < numberOfRows; y++) {
    for (let x = 0; x < numberOfBlocks; x++) {
      blocks.push({
        x: x * blockWidth + margin,
        y: BLOCK_HEIGHT * y + MARGIN * y + MARGIN
      })
    }
  }
}

function resetBall() {
  if (lives === 0) {
    paused = true
  }

  ballX = canvas.width / 2
  ballY = canvas.height / 2
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
  return blocks.findIndex(block => {
    return (
      ballX <= block.x + BLOCK_WIDTH + BALL_RADIUS &&
      ballX >= block.x - BALL_RADIUS &&
      ballY - BALL_RADIUS <= block.y + BLOCK_HEIGHT
    )
  })
}

function checkBlockCollisionLocation(block) {
  if (!block) {
    return -1
  }

  const topHalfOfBlockStart = block.y + BLOCK_HEIGHT / 2

  return ballY <= topHalfOfBlockStart ? -1 : 1
}

function checkBottomEdgeCollision() {
  return ballY + BALL_RADIUS >= canvas.height && Math.sign(velocityY) === 1
}

function checkTopEdgeCollision() {
  return ballY - BALL_RADIUS <= 0 && Math.sign(velocityY) === -1
}

function enforceXVelocity() {
  if (Math.abs(velocityX) > MAX_X_VELOCITY) {
    velocityX = Math.sign(velocityX) * MAX_X_VELOCITY
  }

  if (Math.abs(velocityX) < MIN_X_VELOCITY) {
    velocityX = Math.sign(velocityX) * MIN_X_VELOCITY
  }
}
