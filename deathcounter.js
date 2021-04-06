const TWITCHUSER = "{{username}}"
const OAUTH_BOT = "{{ouathcode}}"
// This will be the account that sends chat messages. Can either be your streaming account OR a bot
// get ouath code from here -> https://twitchapps.com/tmi/

// Timer System
timers_global = {
    "default": {{globalCooldown}}
}

timers_user = {
    "default": {{userCooldown}}
}

function getCommandTimerGlobal(command, timerOBJ) {
    if (typeof timerOBJ[command] === "undefined") {
        return "command not ran yet";
    }
    return timerOBJ[command].filter(element => element.name === "global")[0].time;
}

function getCommandTimerUser(command, user, timerOBJ) {
    if (typeof timerOBJ[command] === "undefined" || typeof timerOBJ[command].filter(element => element.name === user)[0] === "undefined") {
        return "command not ran yet";
    }
    return timerOBJ[command].filter(element => element.name === user)[0].time;
}

function setCommandTimerGlobal(command, timerOBJ) {
    // Sets the commands last global run time to "now"
    if ( getCommandTimerGlobal(command, timerOBJ) === "command not ran yet" ) {
        timerOBJ[command] = [
            {
                "name": "global"
            }
        ];
    }
    timerOBJ[command].filter(element => element.name === "global")[0].time = new Date();
}

function setCommandTimerUser(command, user, timerOBJ) {
    // Sets the commands last user  run time to "now"
    if (getCommandTimerUser(command, user, timerOBJ) === "command not ran yet" ) {
        timerOBJ[command].push(
            {
                "name": user
            });
    }
    timerOBJ[command].filter(element => element.name === user)[0].time = new Date();
}

function setCommandTimer(command, user, timerOBJ) {
    setCommandTimerGlobal(command, timerOBJ);
    setCommandTimerUser(command, user, timerOBJ);
}

function checkCommandTimer(command, user, timerOBJ) {
    // Now lets check if the command should be ran or not
    // GLOBAL
    const global_timer_check = checkCommandTimerGlobal(command, timerOBJ, timers_global);

    // USER
    const user_timer_check = checkCommandTimerUser(command, user, timerOBJ, timers_user);

    return [ global_timer_check[0] && user_timer_check[0], global_timer_check[1], user_timer_check[1] ]
}

function checkCommandTimerGlobal(command, timerOBJ, timers) {
    const current_time = new Date();
    const timer = (typeof timers[command] === "undefined" ? timers["default"] : timers[command])
    const global_timer = getCommandTimerGlobal(command, timerOBJ);
    if (global_timer === "command not ran yet") {
        return [true, 0]
    } else if ( (current_time - global_timer)/1000 > timer) {
        return [true, 0]
    } else {
        return [false, Math.round(timer - (current_time - global_timer)/1000)]
    }
}

function checkCommandTimerUser(command, user, timerOBJ, timers) {
    const current_time = new Date();
    const timer = (typeof timers[command] === "undefined" ? timers["default"] : timers[command])
    const user_timer = getCommandTimerUser(command, user, timerOBJ);
    if (user_timer === "command not ran yet") {
        return [true, 0]
    } else if ( (current_time - user_timer)/1000 > timer) {
        return [true, 0]
    } else {
        return [false, Math.round(timer - (current_time - user_timer)/1000)]
    }
}

function runCommandTimer(command, user, timerOBJ) {
    const timer_check = checkCommandTimer(command, user, timerOBJ);
    if ( timer_check[0] === true ) {
        // if true, the command can run. set the time and return true to "run"
        setCommandTimerGlobal(command, timerOBJ);
        setCommandTimerUser(command, user, timerOBJ);
        return [true, 0, 0]
    } else {
        return [false, timer_check[1], timer_check[2]]
    }
} 

function timeLeft(timeroutput) {
    return Math.max(timeroutput[1], timeroutput[2])
}


let cooldown_gamble = {};
  const gamble_cooldown = 30000;

  let command_timers = {
  }


// Object Structure
/*
SE_API.store.set('DeathStorage', {
  'deathObjects':
  [
    {
      'gameName': 'dark souls 2',
      'deaths': 10,
      'split': []
    }
  ],
  'setting': 'dark souls 2'
  }
);

SE_API.store.get('DeathStorage').then(obj => {
  console.log(obj['setting']);
}); 
*/


// Odometer Settings
var el = document.querySelector('#deathcounter');
od = new Odometer({
  el: el,
  value: "0",
  // Any option (other than auto and selector) can be passed in here
  format: 'd'
});

function setDeaths(n) {
  $("#deathcounter").text(n);
}

function getDeaths() {
  return document.getElementById("deathcounter").textContent;
}

var deathMotion;

function showDeaths() {
  
}

function changeDeaths(n) {
  showDeaths();
  deathMotion = setTimeout(function() {
    $("#deathcounter").text(n);
  }, 1750);
}

function deathStorageIncrement() {
  SE_API.store.get('DeathStorage').then(obj => {
    console.log(obj);
    const deathSetting = obj['setting'];
    let deathObject = obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)]
    const currentDeaths = deathObject['deaths'];
    const deaths = currentDeaths + 1;

    // Change and show visual display
    if ({{deathMessageFlag}}) {
    	ComfyJS.Say("/me {{username_deathmessage}} has died " + String(deaths) + " times!");
    }
    changeDeaths(deaths);

    // Change object, and save to storage
    deathObject['deaths'] = deaths;
    obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)] = deathObject;
    SE_API.store.set('DeathStorage', obj);
  });  
}

function deathStorageSet(n_deaths="") {
  SE_API.store.get('DeathStorage').then(obj => {
    console.log(obj);
    const deathSetting = obj['setting'];
    let deathObject = obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)]
    const currentDeaths = deathObject['deaths'];
    const deaths = (n_deaths === "") ? currentDeaths:parseInt(n_deaths);

    // Change and show visual display
    ComfyJS.Say("/me Deaths set from " + String(currentDeaths) + " -> " + String(deaths) + " in " + deathSetting);
    changeDeaths(deaths);

    // Change object, and save to storage
    deathObject['deaths'] = deaths;
    obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)] = deathObject;
    SE_API.store.set('DeathStorage', obj);
  });  
}

function deathStorageSetGame(game_name="") {
  SE_API.store.get('DeathStorage').then(obj => {
    const deathSetting = (game_name === "") ? obj['setting']:game_name.toLowerCase();
    let deathObject;
    deathObject = obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)]
    if( typeof deathObject === 'undefined' ) {
      deathObject = {
        'gameName': deathSetting,
        'deaths': 0,
        'splits': []
      };
    }
    const currentDeaths = deathObject['deaths'];

    // Change and show visual display
    ComfyJS.Say("/me Death Counter set to " + deathSetting + " with " + currentDeaths + " deaths");
    changeDeaths(currentDeaths);

    // Change object, and save to storage
    obj.deathObjects.push(deathObject);
    obj['setting'] = deathSetting;
    SE_API.store.set('DeathStorage', obj);
  });  
}

// On Window Load
window.addEventListener('onWidgetLoad', async function (obj) {
  SE_API.store.get('DeathStorage').then(obj => {
      const deathSetting = obj['setting'];
      const deathObject = obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)]
	  const deaths = deathObject['deaths'];
      setDeaths(deaths);
    });  
});

// On Command
ComfyJS.onCommand = ( user, command, message, flags, extra ) => {
  if ( command === "deathhelp" ) {
    const timer_check = runCommandTimer("deathhelp", user, command_timers);
    if (timer_check[0] === true) {
    	ComfyJS.Say("/me !deaths = check current deaths | !death = add death | !setdeaths = change deaths to specific number | !deathsetgame = change game counter");
    }
  }
  if ((flags.broadcaster || flags.mod || flags.vip) && (command === "death" || command === "death+")) {
    const timer_check = runCommandTimer("death", user, command_timers);
    if (timer_check[0] === true) {
    	deathStorageIncrement();
    }
  }
  if ((flags.broadcaster || flags.mod) && (command === "deathset" || command === "setdeath" || command === "setdeaths")) {
    const timer_check = runCommandTimer("deathset", user, command_timers);
    if (timer_check[0] === true) {
    	deathStorageSet(message);
    }
  }
  if ((flags.broadcaster || flags.mod) && command === "deathsetgame") {
    const timer_check = runCommandTimer("deathsetgame", user, command_timers);
    if (timer_check[0] === true) {
    	deathStorageSetGame(message);
    }
  }
  
  if (command === "deaths") {
    const timer_check = runCommandTimer("deaths", user, command_timers);
    if (timer_check[0] === true) {
      SE_API.store.get('DeathStorage').then(obj => {
        console.log(obj);
        const deathSetting = obj['setting'];
        const deathObject = obj.deathObjects[obj.deathObjects.findIndex(element => element.gameName === deathSetting)]
        const deaths = deathObject['deaths'];
        ComfyJS.Say("/me {{username_deathmessage}} has died " + String( deaths ) + " times in " + deathSetting + "!");
        showDeaths();
        //SE_API.store.set('CounterStorage', obj);
      });  
    }
  }
}


ComfyJS.Init(TWITCHUSER, OAUTH_BOT);
