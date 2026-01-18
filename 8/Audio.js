let trackList = {
  "1":{
    name: "Plume",
    url: "caravan_palace_plume.mp3"
  },
  "2":{
    name: "Moonshine",
    url: "caravan_palace_moonshine.mp3"
  },
  "3":{
    name: "Melancolia",
    url: "caravan_palace_melancolia.mp3"
  },
}

/**
 * Audio class to manage a playlist and an audio element
 */
export default class Audio {
  constructor() {
    this.audioNode = document.querySelector("#audio");
    this.source = this.audioNode.querySelector("source");
    this.tracks = Object.values(trackList);
    this.started = false;
    this.audioNode.onended = () => {
      console.log("Song has ended")
      this.nextTrack();
    };
    this.tracksetEvent = new Event("trackset");
  }

  /**
   * Start the audio playback
   */
  start() {
    if (!this.started) {
      this.setTrack(0);
      this.started = true;
      console.log("audio started");
    }
  }

  /**
   * Set the current track
   * @param {Number} id - the id of the track to play
   */
  setTrack(id) {
    if (id < 0) { 
      id = this.tracks.length - 1;
    } else if (id > this.tracks.length - 1) {
      id = 0;
    }
    this.currentTrackIndex = id;
    this.source.src = this.getCurrentTrack().url;
    this.audioNode.load();
    this.audioNode.play();
    this.audioNode.dispatchEvent(this.tracksetEvent);

    console.log("track setted " + this.currentTrackIndex);
  }

  /**
   * Get the current track
   * @returns {Object}
   */
  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  /**
   * Go to the next track in the playlist
   */
  nextTrack() {
    this.setTrack(this.currentTrackIndex + 1);
  }

  /**
   * Go to the previous track in the playlist
   */
  previousTrack() {
    this.setTrack(this.currentTrackIndex - 1);
  }
}
