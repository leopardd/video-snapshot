// easy hack to guide vscode
// const Rx = require('rxjs/Rx')

/** @type {HTMLVideoElement} */
const videoEle = document.getElementById('video')
const progress1Ele = document.getElementById('progress1')
const progress2Ele = document.getElementById('progress2')
const playBtnEle = document.getElementById('play-btn')
const pauseBtnEle = document.getElementById('pause-btn')
const restartBtnEle = document.getElementById('restart-btn')
const skipBtnEle = document.getElementById('skip-btn')

// unused
let duration = 0

// ================================================================ Event

// unused
playBtnEle.onclick = function () {
  if (videoEle.paused) {
    // reset duration incase future feats
    // that we will can change video
    duration = videoEle.duration
    videoEle.play()
    log(`play, video duration ${duration}`)
  }
}

// unused
pauseBtnEle.onclick = function () {
  if (!videoEle.paused) {
    videoEle.pause()
    log(`pause at ${videoEle.currentTime}`)
  }
}

// unused
restartBtnEle.onclick = function () {
  videoEle.currentTime = 0
  log('reset to 0')
}

// unused
skipBtnEle.onclick = function () {
  const current = videoEle.currentTime
  videoEle.currentTime += 5
  const next = videoEle.currentTime
  if (current !== next) {
    log(`skip from ${current} to ${next}`)
  }
}

// ================================================================ Function

function updateProgressBar (ele, currentTime) {
  const style = `transform: scaleX(${currentTime / videoEle.duration})`
  ele.style = style
}

// ================================================================ Pure function

function log (str) {
  console.log(str)
}

/**
 * @see https://stackoverflow.com/questions/7505623/colors-in-javascript-console
 * @param {string} str
 */
function rxLog (str) {
  console.log(`%c ${str}`, 'background: #fff; color: #ff21e5')
}

// ================================================================ Steam

// Rx event
const videoEventKey = {
  play: 'play',
  ended: 'ended',
  timeupdate: 'timeupdate'
}

const startStream = Rx.Observable.fromEvent(videoEle, videoEventKey.play)
const endStream = Rx.Observable.fromEvent(videoEle, videoEventKey.ended)
const timeupdateStream = Rx.Observable.fromEvent(videoEle, videoEventKey.timeupdate)

// each time we trigger "play" event, it will create another "startStream"
// begin with "startStream", it will trigger stream upon to number of stream we have
// but we only need 1 steam, so we have 2 options
// 1. we need to remove existing steam before create new one
// 2. prevent, creating new "startStream", if we already have one
//
// end with takeUntil by "endStream", will remove this steam after video was ended
const progressSteam = startStream
.flatMap(function () {
  return timeupdateStream.map(function () {
    return videoEle.currentTime
  }).takeUntil(endStream)
})

// ================================================================ Steam subscriber

startStream.subscribe(function (e) {
  rxLog(videoEventKey.play)
})

endStream.subscribe(function (e) {
  rxLog(videoEventKey.ended)
})

timeupdateStream.subscribe(function (e) {
  updateProgressBar(progress1Ele, e.target.currentTime)
})

progressSteam.subscribe(function (currentTime) {
  updateProgressBar(progress2Ele, currentTime)
})
