/* eslint-disable space-before-function-paren */

const canvas = document.querySelector('canvas')
const speedButtons = document.getElementsByClassName('speed-button')
const context = canvas.getContext('2d')
const endMessageDiv = document.querySelector('.end-message')
const endMessageParagraph = document.querySelector('.end-message p')
const startButton = document.querySelector('.end-message button')

const BLOCK_SIZE = 20
const BOARD_WIDTH = 22
const BOARD_HEIGHT = 32
let MOVE_INTERVAL = 500
let playing = false
const NORMAL_APPLE_POINTS = 100
const MAGIC_APPLE_POINTS = 1000

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// snake
function initializeSnake(position) {
  const snake = {
    body: [position],
    direction: 'right'
  }
  return snake
}

let snake

let currentDirection = 'right'
let points = 0
let magicDoorsDisabled = false
const lastMagicDoorPosition = [0, 0]

// board

function initializeBoard() {
  MOVE_INTERVAL = 500
  const board = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(0)
  )

  // Initialise border
  board[0].fill(2)
  board[board.length - 1].fill(2)
  for (let i = 0; i < board.length; i++) {
    board[i][0] = 2
    board[i][board[i].length - 1] = 2
  }
  // Horizontal doors
  board[BOARD_HEIGHT / 2][0] = 4
  board[BOARD_HEIGHT / 2][BOARD_WIDTH - 1] = 4

  // Vertical doors
  board[0][BOARD_WIDTH / 2] = 4
  board[BOARD_HEIGHT - 1][BOARD_WIDTH / 2] = 4

  return board
}

function initializeGame() {
  playing = true
  endMessageDiv.classList.add('hidden')
  board = initializeBoard()
  snake = initializeSnake([10, 10])
  points = 0
  update()
}

// keyboard events
function keydownEventHandler(event, snake) {
  // Controls
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      if (currentDirection === 'down') break
      snake.direction = 'up'
      break
    case 'ArrowDown':
    case 'KeyS':
      if (currentDirection === 'up') break
      snake.direction = 'down'
      break
    case 'ArrowLeft':
    case 'KeyA':
      if (currentDirection === 'right') break
      snake.direction = 'left'
      break
    case 'ArrowRight':
    case 'KeyD':
      if (currentDirection === 'left') break
      snake.direction = 'right'
      break
  }
  // Speed
  switch (event.code) {
    case 'Digit1':
      MOVE_INTERVAL = 500
      break
    case 'Digit2':
      MOVE_INTERVAL = 300
      break
    case 'Digit3':
      MOVE_INTERVAL = 200
      break
    case 'Digit4':
      MOVE_INTERVAL = 100
      break
    case 'Digit5':
      MOVE_INTERVAL = 1
      break
  }

  // Start
  if (playing === false) {
    switch (event.code) {
      case 'Space':
      case 'Enter':
        initializeGame()
        break
    }
  }
}

document.addEventListener('keydown', (event) =>
  keydownEventHandler(event, snake)
)

Array.from(speedButtons).forEach((button) => {
  button.addEventListener('click', (event) => {
    const speedValue = parseInt(event.target.value)
    MOVE_INTERVAL = speedValue
    canvas.focus()
  })
})

document.addEventListener('DOMContentLoaded', () => {
  const tempMessage = document.querySelector('.temp-message')

  setTimeout(() => {
    tempMessage.classList.add('fade-out')

    tempMessage.addEventListener('animationend', () => {
      tempMessage.style.display = 'none'
    })
  }, 5000)
})

startButton.addEventListener('click', () => {
  initializeGame()
})

function checkCollision() {
  const [headX, headY] = snake.body[0]

  // if (headX < 0 || headX >= BOARD_WIDTH || headY < 0 || headY >= BOARD_HEIGHT) {
  //   return true
  // }

  if (board[headY][headX] && board[headY][headX] === 2) {
    return true
  }

  // Body collision
  for (let i = 1; i < snake.body.length; i++) {
    const [bodyX, bodyY] = snake.body[i]
    if (headX === bodyX && headY === bodyY) {
      return true
    }
  }

  return false
}

function checkMagicDoor() {
  const [headX, headY] = snake.body[0]

  if (
    headX === -1 ||
    headX === BOARD_WIDTH ||
    headY === -1 ||
    headY === BOARD_HEIGHT
  ) {
    magicDoorsDisabled = true
    const newPosition = getRandomMagicDoor()

    snake.body[0] = newPosition
  }
}

function getRandomMagicDoor() {
  const magicDoors = []

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 4) {
        if (x !== lastMagicDoorPosition[0] || y !== lastMagicDoorPosition[1]) {
          magicDoors.push([x, y])
        }
      }
    })
  })

  const newPosition = magicDoors[Math.floor(Math.random() * magicDoors.length)]
  // update direction
  if (newPosition[0] === 0) {
    snake.direction = 'right'
    currentDirection = 'right'
  }
  if (newPosition[0] === BOARD_WIDTH - 1) {
    snake.direction = 'left'
    currentDirection = 'left'
  }
  if (newPosition[1] === 0) {
    snake.direction = 'down'
    currentDirection = 'down'
  }
  if (newPosition[1] === BOARD_HEIGHT - 1) {
    snake.direction = 'up'
    currentDirection = 'up'
  }

  return newPosition
}

function checkEatingApple() {
  const [headX, headY] = snake.body[0]

  if (board[headY][headX] === 3) {
    board[headY][headX] = 0
    eatingApple = true
    return 3
  } else if (board[headY][headX] === 6) {
    eatingMagicApple = true
    return 6
  }
  return false
}

// Game loop
let moveTimer = 0
let applePosition = []
let magicApplePosition = []
let appleCounter = 1
let magicAppleCounter = 1
let lastTime = 0
let eatingApple = false
let eatingMagicApple = false

let board

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  moveTimer += deltaTime

  if (moveTimer > MOVE_INTERVAL) {
    move()
    points -= 100
    moveTimer = 0
  }

  if (playing) {
    draw()
    window.requestAnimationFrame(update)
  }
}

function move() {
  updateDirection()
  updateHead()
  if (checkCollision()) {
    handleGameOver()
  }
  updateTail()
  updateApple()
  updateMagicApple()
  updatePunctuation()
}

function updateDirection() {
  currentDirection = snake.direction
}

function handleGameOver() {
  playing = false

  endMessageParagraph.innerHTML = `Game Over! 😵‍💫<br>Tu puntuación es ${points.toLocaleString(
    'en-US'
  )}`
  endMessageDiv.classList.remove('hidden')
}

function updateHead() {
  const [headX, headY] = snake.body[0]
  lastMagicDoorPosition[0] = headX
  lastMagicDoorPosition[1] = headY
  let newHead
  switch (snake.direction) {
    case 'up':
      newHead = [headX, headY - 1]
      break
    case 'down':
      newHead = [headX, headY + 1]
      break
    case 'left':
      newHead = [headX - 1, headY]
      break
    case 'right':
      newHead = [headX + 1, headY]
      break
  }
  snake.body.unshift(newHead)

  if (!magicDoorsDisabled) {
    checkMagicDoor()
    magicDoorsDisabled = false
  }

  checkEatingApple()
}

function updateTail() {
  if (eatingApple) {
    eatingApple = false
    points += (25 - appleCounter) * NORMAL_APPLE_POINTS
    appleCounter = 0
    return
  } else if (eatingMagicApple) {
    eatingMagicApple = false
    points += (150 - magicAppleCounter) * MAGIC_APPLE_POINTS
    magicAppleCounter = 0
    showWellDoneMessage()
    return
  }
  const [x, y] = snake.body.pop()
  board[y][x] = 0
  restoreMagicDoors([x, y])
}

function restoreMagicDoors(position) {
  // Horizontal doors
  if (board[BOARD_HEIGHT / 2][0] !== 1) board[BOARD_HEIGHT / 2][0] = 4
  if (board[BOARD_HEIGHT / 2][BOARD_WIDTH - 1] !== 1) {
    board[BOARD_HEIGHT / 2][BOARD_WIDTH - 1] = 4
  }

  // Vertical doors
  if (board[0][BOARD_WIDTH / 2] !== 1) board[0][BOARD_WIDTH / 2] = 4
  if (board[BOARD_HEIGHT - 1][BOARD_WIDTH / 2] !== 1) {
    board[BOARD_HEIGHT - 1][BOARD_WIDTH / 2] = 4
  }
}

function showWellDoneMessage() {
  const wellDoneMessage = document.querySelector('.well-done-message')
  wellDoneMessage.classList.remove('hidden')
  setTimeout(() => {
    wellDoneMessage.classList.add('hidden')
  }, 3000)
}

function updateMagicApple() {
  magicAppleCounter++

  if (magicAppleCounter === 100) {
    const emptyCells = []
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) {
          emptyCells.push([x, y])
        }
      })
    })

    const randomIndex = Math.floor(Math.random() * emptyCells.length)
    magicApplePosition = emptyCells[randomIndex]
    setApple(magicApplePosition, 6)
  } else if (magicAppleCounter === 150) {
    clearApple(magicApplePosition)
    magicAppleCounter = 0
  }
}

function updateApple() {
  appleCounter++

  if (appleCounter === 5) {
    const emptyCells = []
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) {
          emptyCells.push([x, y])
        }
      })
    })

    const randomIndex = Math.floor(Math.random() * emptyCells.length)
    applePosition = emptyCells[randomIndex]
    setApple(applePosition)
  } else if (appleCounter === 30) {
    clearApple(applePosition)
    appleCounter = 0
  }
}

function updatePunctuation() {
  document.querySelector('#points').innerHTML = points.toLocaleString('en-US')
}

function setApple(position, type = 3) {
  board[position[1]][position[0]] = type
}

function clearApple(position) {
  board[position[1]][position[0]] = 0
}

function draw() {
  context.fillStyle = '#000'
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        drawRoundSquare(context, x, y, 'green', 0.1)
      }
      if (value === 2) {
        drawRoundSquare(context, x, y, 'rgb(153, 193, 241)', 0.2)
      }
      if (value === 3) {
        drawRoundSquare(context, x, y, 'yellow', 0.4)
      }
      if (value === 5) {
        // Head snake
        drawRoundSquare(context, x, y, 'green', 0.4)
      }
      if (value === 6) {
        // Magic apple
        drawRoundSquare(context, x, y, 'red', 0.4)
      }
    })
  })
  // Round head snake
  snake.body.forEach(([x, y]) => {
    board[y][x] = 1
  })
  board[snake.body[0][1]][snake.body[0][0]] = 5
}

draw()

function drawRoundSquare(context, x, y, color, cornerRadius = 0.2) {
  context.fillStyle = color

  context.beginPath()
  context.moveTo(x + cornerRadius, y)
  context.lineTo(x + 1 - cornerRadius, y)
  context.quadraticCurveTo(x + 1, y, x + 1, y + cornerRadius)
  context.lineTo(x + 1, y + 1 - cornerRadius)
  context.quadraticCurveTo(x + 1, y + 1, x + 1 - cornerRadius, y + 1)
  context.lineTo(x + cornerRadius, y + 1)
  context.quadraticCurveTo(x, y + 1, x, y + 1 - cornerRadius)
  context.lineTo(x, y + cornerRadius)
  context.quadraticCurveTo(x, y, x + cornerRadius, y)
  context.fill()
}
