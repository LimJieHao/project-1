import "./style.css";
import $ from "jquery";
import questionsList from "./questions";
import moneybagSvg from "./img/money-bag.svg";
import timerSvg from "./img/timer.svg";
import audienceImg from "./img/audience.png";
import friendImg from "./img/friend.png";
import fiftyfiftyImg from "./img/50-50.png";

// Game and user objects!
// Game object
// line lifes picture - https://imgur.com/sQvoOhJ
const gameObject = {
  prizeLadder: ["100","200","300","500","1,000","2,000","4,000","8,000","16,000","32,000","64,000","125,000","250,000","500,000","1,000,000"],
  options: ["A", "B", "C", "D"],
  time: 30,
  roundTimer: null,
  display: { moneybag: moneybagSvg, timer: timerSvg },
  lifelinesImg: [audienceImg, friendImg, fiftyfiftyImg],
  lifelinesId: ["audience", "friend", "fifty-fifty"],
  friend: ["Dad","Mum","Brother","Sister","Girlfriend","Boyfriend","Tom","Dick","Harry","Lucas",],
  friendResponse: ["I think it is","I read it on the internet, it is","I read this on the newspaper yesterday, it is","I know this one. It is","I am guessing it is",],
};

// User profile
const userProfile = {
  Progress: 0,
  score: 0,
  currentOptions: ["A", "B", "C", "D"],
  //correspond to the game object lifelines Id
  lifelines: [1, 1, 1],
};

// General functions to shorten the code!
// function to create html element
const $generateHTMLElement = (htmlElement,numOfDiv,attrName,attrValue,parent,appendOrPrepend) => {
  for (let i = 1; i <= numOfDiv; i++) {
    const $htmlElement = $(`<${htmlElement}>`).attr(attrName, attrValue);
    $(parent)[appendOrPrepend]($htmlElement);
  }
};

// function to enable or disable buttons for an array of buttons
const $enableOrDisableDiv = (arrayOfButtonsId,addClassOrRemove,enabledOrDisabled) => {
  // disable all other options button via loop
  for (const element of arrayOfButtonsId) {
    $(`#${element}`)[addClassOrRemove]("disabled-div").prop(enabledOrDisabled, true);
  }
};

// Game function!
// Game display function!
// display the prize ladder
const $displayPrizeLadder = (prizeLadder, Progress) => {
  // hide header, logo and menu div
  $("#header").hide();
  $("#logo").hide();
  $(".startmenu").hide();
  $(".timerbank").remove();
  $(".lifeline").remove();
  // create the divs for the ladder
  $generateHTMLElement("div",1,"class","ladder container","#overall-footer-container","append");
  $generateHTMLElement("div", 15, "class", "prize", ".ladder", "append");
  // insert prize ladder text into divs
  for (let i = 0; i < gameObject.prizeLadder.length; i++) {
    let prizeNum = gameObject.prizeLadder.length - 1 - i;
    let prizeQuestionIndex = gameObject.prizeLadder.length - i;
    $(".prize").eq(i).text(`${[prizeQuestionIndex]} $${gameObject.prizeLadder[prizeNum]}`);
  }
  // change the css of current level
  let prizeQuestionIndex = gameObject.prizeLadder.length - userProfile.Progress - 1;
  $(".prize").eq(prizeQuestionIndex).css("background-color", "#FF8326").addClass("blink");
};

// display question
const $displayQuestion = (index) => {
  // hide prize ladder div
  $("#header").show();
  $(".ladder").remove();
  $("#logo").show();
  // create the divs for timer and current prize value
  $generateHTMLElement("div",1,"class","timerbank container","#overall-body-container","prepend");
  $generateHTMLElement("div",2,"class","displaytimebank container",".timerbank","append");
  $generateHTMLElement("img",1,"class","display",".displaytimebank","append");
  $generateHTMLElement("div", 1, "class", "text", ".displaytimebank", "append");
  // create divs for the three life lines
  $generateHTMLElement("div",1,"class","lifeline container","#overall-body-container","append");
  $generateHTMLElement("img", 3, "class", "lifelineimg", ".lifeline", "append");
  // create the divs
  $generateHTMLElement("div",1,"class","qn container","#overall-footer-container","append");
  $generateHTMLElement("div", 1, "id", "question", ".qn", "append");
  $generateHTMLElement("div",2,"class","opt container","#overall-footer-container","append");
  $generateHTMLElement("div", 2, "class", "option", ".opt", "append");
  // current winnings text
  $(".display").eq(0).attr("src", `${gameObject.display.moneybag}`);
  $(".text").eq(0).text(`$${userProfile.score}`);
  // reset timer, start timer and user current winnings
  gameObject.time = 30;
  gameObject.roundTimer = setInterval(timer, 1000);
  // insert 3 life lines images
  for (let i = 0; i < gameObject.lifelinesId.length; i++) {
    $(".lifelineimg").eq(i).attr("src", gameObject.lifelinesImg[i]).attr("id", gameObject.lifelinesId[i]);
  }
  // disabled life lines that are used up
  for (let i = 0; i < userProfile.lifelines.length; i++) {
    if (userProfile.lifelines[i] === 0)
      $(".lifelineimg").eq(i).attr("src", gameObject.lifelinesImg[i]).attr("id", gameObject.lifelinesId[i]).css("opacity", "0.3").addClass("disabled-div").prop("enabled", true);
  }
  // add life line event listener for audience lifeline
  $(".lifelineimg").eq(0).on("click", audienceLifeline);
  // add life line event listener for friend lifeline
  $(".lifelineimg").eq(1).on("click", friendLifeline);
  // add life line event listener for 50-50 lifeline
  $(".lifelineimg").eq(2).on("click", fiftyfiftyLifeline);
  // reset the user available options
  userProfile.currentOptions = gameObject.options;
  // insert question into div
  $("#question").text(`${questionsList[index].question}`);
  // loop the ids into the options and text
  for (let i = 0; i < gameObject.options.length; i++) {
    let objKey = "option" + gameObject.options[i];
    $(".option").eq(i).attr("id", gameObject.options[i]);
    $(".option").eq(i).text(`${gameObject.options[i]}. ${questionsList[index][objKey]}`);
  }
  // add event listener for the options
  const $answerSelected = (event) => {
    $suspenseAndReflectAns($(event.currentTarget).attr("id"));
  };
  $(".option").on("click", $answerSelected);
};

// Game round timer function!
// function to run and stop the round timer
const timer = () => {
  if (gameObject.time > -1) {
    $(".display").eq(1).attr("src", `${gameObject.display.timer}`).text(`${gameObject.time}`);
    $(".text").eq(1).text(`${gameObject.time}`);
    gameObject.time--;
  } else if (gameObject.time === -1) {
    gameObject.time = -2;
    clearInterval(gameObject.roundTimer);
    reflectAnsAfterTimeOut();
  }
};

// Game life line function!
// function for audience lifeline
const audienceLifeline = () => {
  // turn on modal
  $(".modal").css("display", "block");
  // clear modal
  $(".modalheader").text("");
  $(".modalresponse").text("");
  // Insert header words for modal
  $(".modalheader").text("Audience");
  // create the canvas html element
  $generateHTMLElement("canvas",1,"id","myChart",".modalresponse","append");
  // random generate percentages
  const randomNumberArray = [];
  let randomTotal = 0;
  for (let i = 0; i < userProfile.currentOptions.length; i++) {
    // Step 1: Generate random numbers between 0 and 1
    let randomindex = Math.random() * userProfile.currentOptions.length;
    randomNumberArray.push(randomindex);
    // Step 2: Add these numbers
    randomTotal += randomindex;
  }
  // Step 3: Divide each of the numbers by the sum,
  // Step 4: Multiply by 100, and round to the nearest integer.
  const randomPercentage = randomNumberArray.map((element) => Math.round((element / randomTotal) * 100));
  // Align the percentage with the options to reflect the correct answer and with 90% chance of getting right
  // take out the highest percent to insert into the correct answer index
  let maxPercent = randomPercentage.reduce(function (a, b) {return Math.max(a, b);});
  const chartPercentage = randomPercentage.filter((element) => element !== maxPercent);
  let randomIndex1 = Math.random();
  const correctAnsIndex = userProfile.currentOptions.indexOf(questionsList[userProfile.Progress].key);
  let randomIndex2 = 0;
  if (randomIndex1 <= 0.1) {
    do {randomIndex2 = Math.floor(
        Math.random() * userProfile.currentOptions.length);
    } while (randomIndex2 === correctAnsIndex);
    chartPercentage.splice(randomIndex2, 0, maxPercent);
  } else {
    chartPercentage.splice(correctAnsIndex, 0, maxPercent);
  }
  // Canvas Chart
  let xValues = userProfile.currentOptions;
  let yValues = chartPercentage;
  let barColors = ["red", "green", "blue", "orange"];
  const myAudienceChart = new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            beginAtZero: true,
          },
        },
        y: {
          ticks: {
            color: "white",
            beginAtZero: true,
          },
        },
      },
    },
  });
  // turn off modal
  $(".modal").on("click", () => {$(".modal").css("display", "none");});
  // remove the audience life line
  $("#audience").css("opacity", "0.3").addClass("disabled-div").prop("enabled", true);
  // update user profile
  userProfile.lifelines[0] = 0;
};

// function for friend lifeline
const friendLifeline = () => {
  // turn on modal
  $(".modal").css("display", "block");
  // clear modal
  $(".modalheader").text("");
  $(".modalresponse").text("");
  $("#myChart").remove();
  // insert random friend into modal header
  let randomIndex = Math.floor(Math.random() * gameObject.friend.length);
  $(".modalheader").text(gameObject.friend[randomIndex]);
  // generate 70% chance of getting getting the right answer
  let randomIndex1 = Math.random();
  let friendAnswer = null;
  if (randomIndex1 <= 0.3) {
    const wrongAnswer = userProfile.currentOptions.filter((element) => element !== questionsList[userProfile.Progress].key);
    let randomIndex2 = Math.floor(Math.random() * wrongAnswer.length);
    friendAnswer = wrongAnswer[randomIndex2];
  } else {
    friendAnswer = questionsList[userProfile.Progress].key;
  }
  // insert random response into modal body
  let randomIndex3 = Math.floor(Math.random() * gameObject.friendResponse.length);
  $(".modalresponse").text(`${gameObject.friendResponse[randomIndex3]} ${friendAnswer}.`);
  // turn off modal
  $(".modal").on("click", () => {$(".modal").css("display", "none");});
  // remove the friend life lines
  $("#friend").css("opacity", "0.3").addClass("disabled-div").prop("enabled", true);
  // update user profile
  userProfile.lifelines[1] = 0;
};

// function for 50-50 lifeline
const fiftyfiftyLifeline = () => {
  // create an array that does not contains the answer
  const wrongAnswer = userProfile.currentOptions.filter((element) => element !== questionsList[userProfile.Progress].key);
  // to randomly generate 2 different wrong answers to be eliminated
  const answerToBeEliminated = [];
  while (answerToBeEliminated.length < 2) {
    let randomIndex = Math.floor(Math.random() * wrongAnswer.length);
    // only pushes the random index if it does not exist
    if (answerToBeEliminated.indexOf(wrongAnswer[randomIndex]) === -1) {
      answerToBeEliminated.push(wrongAnswer[randomIndex]);
    }
  }
  // remove the text of the 2 eliminated options
  for (const element of answerToBeEliminated) {
    $(`#${element}`).text("");
  }
  // update the remaining options available incase other lifelines are utilized
  userProfile.currentOptions = userProfile.currentOptions.filter((element) => answerToBeEliminated.includes(element) === false);
  // disable the 2 options eliminated options button
  $enableOrDisableDiv(answerToBeEliminated, "addClass", "enabled");
  // remove the fifty fifty life lines
  $("#fifty-fifty").css("opacity", "0.3").addClass("disabled-div").prop("enabled", true);
  // update user profile
  userProfile.lifelines[2] = 0;
};

// Game animation function!
// function to set delay to create suspense then turn the answer green
const $suspenseAndReflectAns = (id) => {
  // stop timer
  clearInterval(gameObject.roundTimer);
  // identify the rest of the button
  const optionsNotChosen = gameObject.options.filter((element) => element !== id);
  // disable button
  $enableOrDisableDiv(optionsNotChosen, "addClass", "enabled");
  $enableOrDisableDiv(gameObject.lifelinesId, "addClass", "enabled");
  // selected answer as orange
  $(`#${id}`).css("background-color", "#FF8326");
  // show correct answer as green after 2s
  setTimeout(() => {
    $(`#${questionsList[userProfile.Progress].key}`).css("background-color","#37CD3B");}, 2000);
  // check answer after 4s
  setTimeout(() => {checkAnswer(id);}, 4000);
  // enable button
  $enableOrDisableDiv(optionsNotChosen, "remove", "Disabled");
  $enableOrDisableDiv(gameObject.lifelinesId, "remove", "Disabled");
};

const reflectAnsAfterTimeOut = () => {
  // stop timer
  clearInterval(gameObject.roundTimer);
  // identify the all of the button
  const allOptions = gameObject.options;
  // disable all button
  $enableOrDisableDiv(allOptions, "addClass", "enabled");
  $enableOrDisableDiv(gameObject.lifelinesId, "addClass", "enabled");
  // show correct answer as green after 2s
  setTimeout(() => {$(`#${questionsList[userProfile.Progress].key}`).css("background-color","#37CD3B");}, 2000);
  // enable all button
  $enableOrDisableDiv(allOptions, "remove", "Disabled");
  $enableOrDisableDiv(gameObject.lifelinesId, "remove", "Disabled");
  setTimeout(() => {endGame();}, 4000);
};

// Game logic function!
// function to check the user's input
const checkAnswer = (id) => {
  if (userProfile.Progress + 1 === gameObject.prizeLadder.length && id === questionsList[userProfile.Progress].key) {
    updateScore();
    endGame();
  } else if (id === questionsList[userProfile.Progress].key) {
    updateScore();
    continueGame();
  } else {
    endGame();
  }
};

// Game updating function!
// function to update the user's score
const updateScore = () => {
  // Update progress
  userProfile.Progress += 1;
  userProfile.score = gameObject.prizeLadder[userProfile.Progress - 1];
};

const continueGame = () => {
  // Hide the question div
  $(".qn").remove();
  $(".opt").remove();
  $displayPrizeLadder(gameObject.prizeLadder, userProfile.Progress);
  setTimeout(() => {$displayQuestion(userProfile.Progress);}, 2000);
};

const endGame = (highscore) => {
  // Hide all the game objects
  $(".timerbank").remove();
  $(".lifeline").remove();
  $(".qn").remove();
  $(".opt").remove();
  // Create the final score board
  $generateHTMLElement("div", 1, "class", "finalscore","#footer","append");
  $generateHTMLElement("div", 1, "class", "scoreboard","#footer","append");
  $generateHTMLElement("div", 1, "class", "reset container","#footer","append");
  $generateHTMLElement("div", 1, "class", "button",".reset","append");
  // update final score
  if (gameObject.prizeLadder.indexOf(userProfile.score) === gameObject.prizeLadder.indexOf("1,000,000")) {
    userProfile.score = "1,000,000" 
  } else if (gameObject.prizeLadder.indexOf(userProfile.score) >= gameObject.prizeLadder.indexOf("32,000")){
    userProfile.score = "32,000"
  } else if (gameObject.prizeLadder.indexOf(userProfile.score) < gameObject.prizeLadder.indexOf("32,000") && gameObject.prizeLadder.indexOf(userProfile.score) >= gameObject.prizeLadder.indexOf("1,000")){
    userProfile.score = "1,000"
  } else if (gameObject.prizeLadder.indexOf(userProfile.score) < gameObject.prizeLadder.indexOf("1,000") && gameObject.prizeLadder.indexOf(userProfile.score) !== -1) {
    userProfile.score = gameObject.prizeLadder[userProfile.Progress - 1]
  } else if (gameObject.prizeLadder.indexOf(userProfile.score) === -1) {
    userProfile.score = 0
  }
  // add text to the divs
  $(".finalscore").text("Final Score:");
  $(".scoreboard").text(`$${userProfile.score}`);
  $(".button").text("Restart");
  
  // add life line event listener for resetting the game
  $(".button").on("click", restartGame);
};

const restartGame = () => {
  // hide the final score screen
  $(".finalscore").remove();
  $(".scoreboard").remove();
  $(".reset").remove();
  $(".button").remove();
  // reset the game
  userProfile.Progress = 0,
  userProfile.score = 0,
  userProfile.lifelines = [1, 1, 1],
  // show the menu
  $(".startmenu").show();
}

// Main game function!
const startGame = () => {
  $displayPrizeLadder(gameObject.prizeLadder, userProfile.Progress);
  setTimeout(() => {$displayQuestion(userProfile.Progress);}, 2000);
};

// document ready!
$(() => {
  $(".menu").eq(0).on("click", startGame);
});
