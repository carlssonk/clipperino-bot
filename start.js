const axios = require("axios")
const { exec } = require('child_process');
const schedule = require("node-schedule")
const fs = require('fs');


const fetchClips = async () => {
  removeClip() //Removes all .mp4 files in the CLIPS folder
  try {
    // First fetch access token so we can use the API
    const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
    const token = res.data.access_token;
    // Chain of multiple functions, in the end, returns big list of top category/game clips
    fetchTopGames(token);
    // Chain of multiple functions, in the end, returns big list of top user clips
    fetchHandPickedUsers(token);
  } catch(err) {
    console.error("ERROR!", err)
  }
}

// ############ CONFIGURATION ############

// Create an application on https://dev.twitch.tv/console to get your client id and client secret
const clientId = "your_client_id_here"
const clientSecret = "your_client_secret_here" // note your client secret is private thus should not be shown to other people

// EXECUTION TIMES (Schedule when to download or just call "fetchClips()" if you want to download directly)
schedule.scheduleJob({hour: 0, minute: 0}, function(){
  fetchClips()
});
schedule.scheduleJob({hour: 4, minute: 0}, function(){
  fetchClips()
});
schedule.scheduleJob({hour: 8, minute: 0}, function(){
  fetchClips()
});
schedule.scheduleJob({hour: 12, minute: 0}, function(){
  fetchClips()
});
schedule.scheduleJob({hour: 16, minute: 0}, function(){
  fetchClips()
});
schedule.scheduleJob({hour: 20, minute: 0}, function(){
  fetchClips()
});


// ############ CONFIGURATION ############

// Some data used during the fetch and download process
let userClips = [];
let gameClips = [];
let userCounter = 0;
let gameCounter = 0;
let isUserClipsFetched = false;
let isGameClipsFetched = false;

function reset() {
  userClips = [];
  gameClips = [];
  userCounter = 0;
  gameCounter = 0;
  isUserClipsFetched = false;
  isGameClipsFetched = false;
}

function removeClip() {
  console.log("HelloWorld1")
  fs.readdir(`${__dirname}\\CLIPS`, (err, files) => {
    files.forEach(file => {
      if(file.includes(".mp4")) {
        fs.unlinkSync(`${__dirname}\\CLIPS/${file}`)
      }
    });
  });
}

// ########## FETCH GAMES ##########

const fetchTopGames = async (token) => {
  try {
    const config = {
      headers:{
        "Authorization": `Bearer ${token}`,
        "Client-Id": clientId
      }
    }
    const res = await axios.get('https://api.twitch.tv/helix/games/top?first=20', config)
    const gameIdList = [];
    for(let game of res.data.data) {
      gameIdList.push(game.id)
    }
    getAllGameClips(token, gameIdList)
  } catch(err) {
    console.error("ERROR!", err)
  }
}

const getAllGameClips = (token, gameIdList) => {
  // Get 24 hours ago's date in RFC3339 format
  const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString();
  // Se we can excecute another function right after lastIndex is fetched
  const gameListLength = gameIdList.length;
  for(let i = 0; i < gameIdList.length; i++) {
    // Excecute this function for every gameId
    fetchTopGameClipsOfTheDay(token, gameIdList[i], yesterday, gameListLength)
  }
}

const fetchTopGameClipsOfTheDay = async (token, gameId, date, gameListLength) => {
  try {
    const config = {
      headers:{
        "Authorization": `Bearer ${token}`,
        "Client-Id": clientId
      }
    }
    const res = await axios.get(`https://api.twitch.tv/helix/clips?game_id=${gameId}&started_at=${date}&first=7`, config)
    for(let i = 0; i < 7; i++) {
      if(res.data.data[i] === undefined) continue;
      // Push top 7 clips and its data for every game, this array will be 140Clips, 20 Games * 7 Clips for every game
      gameClips.push({url: res.data.data[i].url, views: res.data.data[i].view_count, title: res.data.data[i].title, name: res.data.data[i].broadcaster_name})
    }
    // Below code checks if the userClips is fetched, if its true, execute Combine funciton
    gameCounter++;
    if(gameCounter === gameListLength) {
      isGameClipsFetched = true;
      if(isUserClipsFetched === true) Combine(gameClips, userClips);
    }

  } catch(err) {
    console.error("ERROR!", err)
  }
}



// ########## FETCH USERS ##########

const fetchHandPickedUsers = async (token) => {
  try {
    const config = {
      headers:{
        "Authorization": `Bearer ${token}`,
        "Client-Id": clientId
      }
    }
    const res = await axios.get('https://api.twitch.tv/helix/users?login=xqcow&login=shroud&login=myth&login=pokimane&login=sodapoppin&login=summit1g&login=nickmercs&login=timthetatman&login=loltyler1&login=symfuhny&login=lirik&login=anomaly&login=asmongold&login=mizkif&login=hasanabi&login=ludwig&login=moistcr1tikal&login=mitchjones&login=nmplol&login=jakenbakelive&login=knut&login=maya&login=pokelawls&login=itssliker&login=esfandtv&login=erobb221&login=drdisrespect', config)
    const userIdList = [];
    for(let user of res.data.data) {
      userIdList.push(user.id)
    }
    getAllUserClips(token, userIdList)
  } catch(err) {
    console.error("ERROR!", err)
  }
}

const getAllUserClips = (token, userIdList) => {
  // Get 24 hours ago's date in RFC3339 format
  const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString();
    // Se we can excecute another function right after lastIndex is fetched
    const userListLength = userIdList.length;
  for(let i = 0; i < userIdList.length; i++) {
    // Excecute this function for every userId
    fetchTopClipsOfTheDay(token, userIdList[i], yesterday, userListLength)
  }
}

const fetchTopClipsOfTheDay = async (token, userId, date, userListLength) => {
  try {
    const config = {
      headers:{
        "Authorization": `Bearer ${token}`,
        "Client-Id": clientId
      }
    }
    const res = await axios.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&started_at=${date}&first=7`, config)
    for(let i = 0; i < 7; i++) {
      if(res.data.data[i] === undefined) continue;
      // Push top 7 clips and its data for every user, this array will be all users * 7 clips long
      userClips.push({url: res.data.data[i].url, views: res.data.data[i].view_count, title: res.data.data[i].title, name: res.data.data[i].broadcaster_name})
    }
    // Below code checks if the gameClips is fetched, if its true, execute Combine funciton
    userCounter++;
    if(userCounter === userListLength) {
      isUserClipsFetched = true;
      if(isGameClipsFetched === true) Combine(gameClips, userClips);
    }

  } catch(err) {
    console.error("ERROR!", err)
  }
}

// ########## COMBINE USERS&GAMES AND SEND TO SERVER ##########


const Combine = (gameClips, userClips) => {
  // Merges gameClips and userClips together
  const arr = [...gameClips, ...userClips]

  // Filter outs duplicates
  const seen = new Set();
  const clipsNoDuplicate = arr.filter(el => {
  const duplicate = seen.has(el.url);
  seen.add(el.url);
  return !duplicate;
  });
  // Sort clips from most viewed to least viewed
  const clipsSort = clipsNoDuplicate.sort((a, b) => (a.views < b.views) ? 1 : -1)
  // Return the first 10 clips (10 most viewed clips)
  const clipsReady = clipsSort.slice(0, 10);

  readSavedClips(clipsReady)
}


function readSavedClips(clipsArray) {
  fs.readFile('Data/ClipsUrl.json', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    } else {
      // parse JSON string to JSON object
      const savedClips = JSON.parse(data);
      writeSavedClips(savedClips, clipsArray)
    }
  });
}


function writeSavedClips(savedClips, clipsArray) {
  let index = 0;
  let finalUrl = "";
  // Compares both arrays to avoid duplicate
  for(let i = 0; i < clipsArray.length; i++) {
    if(savedClips.includes(clipsArray[i].url)) {
      index++
    } else {
      break
    }
  }
  // Create json file to send data to python
  createJson(clipsArray[index])
  // Set final url, if somehow its undefined, return this function
  finalUrl = clipsArray[index].url
  if(finalUrl === "" || finalUrl === undefined) return; // failsafe

  // Rewrite ClipsUrl.json
  writeClipsUrlJson(savedClips, finalUrl)

  // Download the actual clip
  downloadClip(finalUrl)
  // Reset Script So we can fetch data again when the next schedule hits.
  reset()
}

// Download the actual clips
function downloadClip(url) {
  exec(`youtube-dl.exe -f best ${url}`, {cwd: `${__dirname}\\CLIPS`}, (err, stdout, stderr) => {
  if (err) return;
  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  startPython()
  });
}

function createJson(data) {
  // Save clip data
  const clipData = JSON.stringify(data);
  fs.writeFile('Data/ClipData.json', clipData, 'utf8', function(err) {
    if (err) return console.log(err);
  });
}

function writeClipsUrlJson(savedClips, finalUrl) {
  // Add url to savedClips
  savedClips.unshift(finalUrl)
  // Remove last item from array so it doesnt get too large
  if(savedClips.length > 9) savedClips.pop()
  // Write the array to the json file
  const savedClipsUpdated = JSON.stringify(savedClips);
  fs.writeFile('Data/ClipsUrl.json', savedClipsUpdated, 'utf8', function(err) {
    if (err) return console.log(err);
  });
}

function startPython() {
  exec(`python youtube-uploader.py`, {cwd: `${__dirname}\\CLIPS`}, (err, stdout, stderr) => {
    if (err) return;
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    });
}

