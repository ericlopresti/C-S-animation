function timeToMilliSeconds(hh, mm, ss, msms) {
  return (
    ((parseInt(hh) * 60 + parseInt(mm)) * 60 + parseInt(ss)) * 1000 +
    parseInt(msms) * 10
  );
}

function transformData(csvData) {
  var dataArray = csvData.trim().split(/\n/);
  dataArray = dataArray.map(val => {
    if (typeof val === 'string' && val.indexOf(',') >= 0) {
      return val.split(/\,/);
    }
    return undefined;
  });
  dataArray.forEach(val => {
    if (Array.isArray(val)) {
      var timeArray = val[0].split(/\;|\:/);
      var totalMilliSeconds = timeToMilliSeconds(...timeArray);
      val.unshift(totalMilliSeconds);
    }
  });
  dataArray = dataArray.filter(val => {
    if (Array.isArray(val) && !Number.isNaN(val[0]) && val.length === 6) {
      return true;
    }
    return false;
  });
  dataArray = dataArray.sort((a, b) => a[0] - b[0]);
  dataArray = dataArray.filter((val, index, array) => {
    if (index > 0 && val[0] === array[index - 1][0]) {
      return false;
    }
    return true;
  });
  return dataArray;
}

function calcTimeStamp(time, scrubTime, isPaused) {
 return `
    Time Elapsed: ${time}ms
    Scrub Time: ${scrubTime}ms
    Paused: ${isPaused}
    Commands:
    Restart: r or shift + r
    Pause/Play: space
    Prev/Next Card: shift + left/right arrows
    Scrub Back/Forward: left/right arrows`;
};

function createTime(displayData) {
  let time = 0;
  let currentIndex = 0;
  let isPaused = false;
  let timer;
  let scrubTime = 0;
  let display = false;
  timestamp.style.display = 'none';

  let timeFunctions = {};

  timeFunctions.resetTimer = () => {
    timestamp.innerText = 'Will start from the beginning when unpaused';
    time = 0;
    currentIndex = 0;
    scrubTime = 0;
  };

  timeFunctions.startTimer = () => {
    isPaused = false;
    timer = setInterval(function() {
      if (displayData[currentIndex][0] <= time + scrubTime) {
        timestamp.innerText =
          'This slide should sync with ' +
          displayData[currentIndex][1] +
          ' in the video.' + calcTimeStamp(time, scrubTime, isPaused);
        changeCard(displayData, currentIndex);
        currentIndex++;
        console.log(time);
        console.log(time+scrubTime);
      }
      if (currentIndex > displayData.length - 1) {
        timeFunctions.resetTimer();
      }
      time += 10;
    }, 10);
  };
  timeFunctions.pauseTimer = () => {
    if (!isPaused) {
      clearInterval(timer);
      isPaused = true;
      scrubTime = 0;
      timestamp.innerText =
          'This slide should sync with ' +
          displayData[currentIndex][1] +
          ' in the video.' + calcTimeStamp(time, scrubTime, isPaused);
    } else {
      timeFunctions.startTimer();
    }
  };
  timeFunctions.increaseTime = () => {
    if (currentIndex < displayData.length - 1) {
      time = displayData[currentIndex + 1][0];
      currentIndex++;
      changeCard(displayData, currentIndex);
      scrubTime = 0;
      timestamp.innerText =
        'Jumped forward to card at ' +
        displayData[currentIndex][1] +
        ' in the video.' + calcTimeStamp(time, scrubTime, isPaused);
    } else {
      timeFunctions.resetTimer();
    }
  };
  timeFunctions.decreaseTime = () => {
    if (currentIndex > 0) {
      time = displayData[currentIndex - 1][0] - 10;
      currentIndex--;
      changeCard(displayData, currentIndex);
      scrubTime = 0;
      timestamp.innerText =
        'Jumped backward to card at ' +
        displayData[currentIndex][1] +
        ' in the video.' + calcTimeStamp(time, scrubTime, isPaused);
    } else {
      timeFunctions.resetTimer();
    }
  };
  timeFunctions.subtractScrub = () => {
    scrubTime = scrubTime - 100;
  };
  timeFunctions.addScrub = () => {
    scrubTime = scrubTime + 100;
  };
  timeFunctions.displayTimeStamp = () => {
    if(!display){
      timestamp.style.display = 'block';
      timestamp.innerText =
          'This slide should sync with ' +
          displayData[currentIndex][1] +
          ' in the video.' + calcTimeStamp(time, scrubTime, isPaused);
      display = true;
    } else {
      timestamp.style.display = 'none';
      display = false;
    }
  };
  return timeFunctions;
}

function changeCard(displayData, index) {
  title.innerText = displayData[index][2];
  subtitle.innerText = displayData[index][3];
  background.style.backgroundColor = displayData[index][4];
  card.style.color = displayData[index][5];
}

window.onload = function() {
  const cardData = transformData(data);
  console.log(cardData);
  const session = createTime(cardData);

  session.startTimer();

  document.addEventListener('keydown', event => {
    const key = event.key;
    if (key === ' ') {
      session.pauseTimer();
    } else if (key === 'ArrowRight' && event.shiftKey) {
      session.increaseTime();
    } else if (key === 'ArrowLeft' && event.shiftKey) {
      session.decreaseTime();
    } else if (key === 'r' || key === 'R') {
      session.resetTimer();
    } else if (key === 'ArrowRight') {
      session.addScrub();
    } else if (key === 'ArrowLeft') {
      session.subtractScrub();
    } else if (key === 'Enter') {
      session.displayTimeStamp();
    } 
  });
};
