console.log("Lets do it then JS")
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/playcircle.svg" alt="">
                            </div> </li>`;
    }

    //Attaching an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //Play the song
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });

    return songs

}

const playMusic = (track, pause=false) => {
    //let audio = new Audio("/Songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for(let index = 0; index < array.length; index++){
        const e = array[index];
        if(e.href.includes("/Songs/") && !e.href.includes(".htaccess")){
            let folder = (e.href.split("/").slice(-1)[0])
            //Get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play">
                                    <svg width="25" height="25" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                            </div>
                            <img src="/Songs/${folder}/cover.jpeg" alt="Throwback Thursday">
                            <p>${response.description}</p>
                        </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })

}

async function main() {

    //Get the list of all songs
    songs = await getSongs("Songs/Chillhop")
    playMusic(songs[0], true)

    //Attach an event Listener to play, next, prev
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an eventListener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    //Add an eventListener to close hamburger
    document.querySelector(".close").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an eventListener for prev and next
    previous.addEventListener("click",()=>{
        console.log("Previous Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index - 1) >= 0){
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click",()=>{
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index + 1) < songs.length){
            playMusic(songs[index + 1])
        }
    })

    //Add an event to increase or decrease volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    //Display all the albums on the page
    displayAlbums()

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log("changing", e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })
}
main()