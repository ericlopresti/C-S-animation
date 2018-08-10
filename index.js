//important! Data must be encased in backticks, not quotation marks
//data must be only comma separated- particularly the time information and colors

const data = `

00;00;00;25,X-ray,1948-04-14,#FF8C00,#FFFFFF
00;00;07;25,Yoke,1948-04-30,#9932CC,#FF00FF
00;00;10;04,Zebra,1948-05-14,#779ECB,#FFFFFF
00;00;13;02,Yannigan-White - 3,1970-02-26,#03C03C,#FF00FF
00;00;15;11,Yannigan-Red - 1,1970-02-26,#966FD6,#FFFFFF
00;00;00;25,X-ray,1948-04-14
00;00;07;25,Yoke,1948-04-30
00;00;10;04,Zebra,1948-05-14
00;00;13;02,Yannigan-White - 3,1970-02-26
00;00;15;11,Yannigan-Red - 1,1970-02-26
00;00;16;26,Yannigan-Blue - 2,1970-02-26,#C23B22,#FF00FF
00;00;19;26,Tun - 4,1969-12-10,#E75480,#FFFFFF
00;00;20;08,Tun - 3,1969-12-10,#003399,#FF00FF
00;00;22;13,Tun - 2,1969-12-10,#4F3A3C,#FFFFFF
00;00;27;27,Tun - 1,1969-12-10,#301934,#FFFFFF
00;00;28;13,Terrine-Yellow - 2,1969-12-18,#872657,#FFFFFF
00;00;31;07,Terrine-White - 1,1969-12-18,#8B0000,#FFFFFF
00;00;34;06,Spider - 2,1969-08-14,#E9967A,#FFFFFF
00;00;37;05,1 (Joe 1),1949-08-29,#560319,#FFFFFF
00;00;50;27,Snubber,1970-04-21,#8FBC8F,#FFFFFF
00;00;53;18,Shaper,1970-03-23,#3C1414,#FFFFFF
00;00;55;15,Seaweed B,1969-10-16,#71706E,#FFFFFF
00;00;57;02,Seaweed - 3,1969-10-01,#8CBED6,#FFFFFF
00;00;58;21,Seaweed - 2,1969-10-01,#483D8B,#FFFFFF
00;01;00;29,Seaweed - 1,1969-10-01,#2F4F4F,#FFFFFF
00;01;04;22,Scuttle,1969-11-13,#177245,#FFFFFF
00;01;07;15,Rulison,1969-09-10,#918151,#FFFFFF
00;01;09;29,Pod - 4,1969-10-29,#FFA812,#FFFFFF
00;01;15;15,Pod - 3,1969-10-29,#483C32,#FFFFFF
00;00;55;15,Seaweed B,1969-10-16,#71706E,#FFFFFF
00;00;57;02,Seaweed - 3,1969-10-01,#8CBED6,#FFFFFF
00;00;58;21,Seaweed - 2,1969-10-01,#483D8B,#FFFFFF
00;01;00;29,Seaweed - 1,1969-10-01,#2F4F4F,#FFFFFF
00;01;04;22,Scuttle,1969-11-13,#177245,#FFFFFF
00;01;07;15,Rulison,1969-09-10,#918151,#FFFFFF
00;01;09;29,Pod - 4,1969-10-29,#FFA812,#FFFFFF
00;01;15;15,Pod - 3,1969-10-29,#483C32,#FFFFFF

`;

//interface: can change if you like

const playPause = ' '; //space
const decreaseTime = 'ArrowLeft';
const increaseTime = 'ArrowRight';
const restart = 'ArrowUp';

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

function createTime(displayData) {
  let time = 0;
  let currentIndex = 0;
  let isPaused = false;
  let timer;

  let timeFunctions = {};

  timeFunctions.resetTimer = () => {
    timestamp.innerText = 'Will start from the beginning when unpaused';
    time = 0;
    currentIndex = 0;
  };

  timeFunctions.startTimer = () => {
    isPaused = false;
    timestamp.style.display = 'none';
    timer = setInterval(function() {
      if (displayData[currentIndex][0] === time) {
        timestamp.innerText =
          'this slide should sync with ' +
          displayData[currentIndex][1] +
          ' in the video.';
        changeCard(displayData, currentIndex);
        currentIndex++;
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
      timestamp.style.display = 'block';
    } else {
      timeFunctions.startTimer();
    }
  };
  timeFunctions.increaseTime = () => {
    if (currentIndex < displayData.length - 1) {
      time = displayData[currentIndex + 1][0];
      currentIndex++;
      changeCard(displayData, currentIndex);
      timestamp.innerText =
        'jumped forward to card at ' +
        displayData[currentIndex][1] +
        ' in the video.';
    } else {
      timeFunctions.resetTimer();
    }
  };
  timeFunctions.decreaseTime = () => {
    if (currentIndex > 0) {
      time = displayData[currentIndex - 1][0] - 10;
      currentIndex--;
      changeCard(displayData, currentIndex);
      timestamp.innerText =
        'jumped backward to card at ' +
        displayData[currentIndex][1] +
        ' in the video.';
    } else {
      timeFunctions.resetTimer();
    }
  };
  return timeFunctions;
}

function changeCard(displayData, index) {
  title.innerText = displayData[index][2];
  subtitle.innerText = displayData[index][3];
  card.style.backgroundColor = displayData[index][4];
  card.style.color = displayData[index][5];
}

window.onload = function() {
  const cardData = transformData(data);
  console.log(cardData);
  const session = createTime(cardData);
  const card = document.getElementById('card');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const timestamp = document.getElementById('timestamp');

  session.startTimer();

  document.addEventListener('keydown', event => {
    const key = event.key;
    if (key === playPause) {
      session.pauseTimer();
    } else if (key === increaseTime) {
      session.increaseTime();
    } else if (key === decreaseTime) {
      session.decreaseTime();
    } else if (key === restart) {
      session.resetTimer();
    }
  });
};
