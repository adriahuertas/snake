/* eslint-disable space-before-function-paren */
import './style.css'

const canvas = document.querySelector('canvas')
const speedButtons = document.getElementsByClassName('speed-button')
const context = canvas.getContext('2d')

const BLOCK_SIZE = 20
const BOARD_WIDTH = 22
const BOARD_HEIGHT = 32
let MOVE_INTERVAL = 500

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// snake
const snake = {
  body: [
    [6, 5],
    [5, 5],
    [4, 5],
    [3, 5],
    [2, 5]
  ],
  direction: 'right'
}

let currentDirection = 'right'
let points = 0
let magicDoorsDisabled = false
const lastMagicDoorPosition = [0, 0]

// board
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

// keyboard events
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
      if (currentDirection === 'down') break
      snake.direction = 'up'
      break
    case 'ArrowDown':
      if (currentDirection === 'up') break
      snake.direction = 'down'
      break
    case 'ArrowLeft':
      if (currentDirection === 'right') break
      snake.direction = 'left'
      break
    case 'ArrowRight':
      if (currentDirection === 'left') break
      snake.direction = 'right'
      break
  }
})

Array.from(speedButtons).forEach((button) => {
  button.addEventListener('click', (event) => {
    const speedValue = parseInt(event.target.value)
    MOVE_INTERVAL = speedValue
    canvas.focus()
  })
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
  }
}

// Game loop
let moveTimer = 0
let applePosition = []
let appleCounter = 1
let lastTime = 0
let eatingApple = false
function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  moveTimer += deltaTime

  if (moveTimer > MOVE_INTERVAL) {
    move()
    points -= 10
    moveTimer = 0
  }

  draw()
  window.requestAnimationFrame(update)
}

function move() {
  updateDirection()
  updateHead()
  if (checkCollision()) {
    alert('Game over!')
    window.location.reload()
  }
  updateTail()
  updateApple()
  updatePunctuation()
}

function updateDirection() {
  currentDirection = snake.direction
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
    points += (30 - appleCounter) * 10
    appleCounter = 0
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
  document.querySelector('#points').innerHTML = points
}

function setApple(position) {
  board[position[1]][position[0]] = 3
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
        context.fillStyle = 'green'
        context.fillRect(x, y, 1, 1)
      }
      if (value === 2) {
        context.fillStyle = 'red'
        context.fillRect(x, y, 1, 1)
      }
      if (value === 3) {
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })
  snake.body.forEach(([x, y]) => {
    board[y][x] = 1
  })
}

update()
