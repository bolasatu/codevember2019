/**
 * AudioAnalyser uses the Web Audio API to analyse an audio source
 */
export default class AudioAnalyser{
    /**
     * @param {Object} props
     * @param {Audio} props.audio - an Audio instance
     * @param {Number} props.fftSize - the fftSize, must be a power of 2
     */
    constructor({audio, fftSize}){
        this.audio = audio;
        this.context = new AudioContext();
        this.src = this.context.createMediaElementSource(this.audio.audioNode);
        this.analyser = this.context.createAnalyser();
        this.src.connect(this.analyser);

        this.analyser.connect(this.context.destination);
        this.analyser.fftSize = fftSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.audio.audioNode.addEventListener('trackset', ()=>{
            this.context.resume();
        });
  
        this.beat = 0;
    }

    /**
     * Should be called at each frame
     * @param {Number} deltaTime - time elapsed since last frame
     */
    refreshData(deltaTime){
        this.analyser.getByteFrequencyData(this.dataArray);
        if(this.beat > 0){
           this.beat -= deltaTime;
        }else{
            this.beat = 0;
        }
    }
    
    /**
     * Extract a portion of the frequency data
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @returns {Uint8Array}
     */
    extractData(min,max){
        let _min = Math.floor(min/100 * this.dataArray.length);
        let _max = Math.ceil(max/100 * this.dataArray.length);
        return this.dataArray.slice(_min, _max);
    }
      
    /**
     * Get the average value of a frequency data slice
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @returns {Number} - a value between 0 and 1
     */
    getMoy(min,max){
        let array = this.extractData(min,max);
        let moy = 0;
        for(let i = 0; i<array.length;i++){
            moy += array[i];
        }
        return (moy/array.length)/255;
    }
    
    /**
     * Get the max value of a frequency data slice
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @returns {Number} - a value between 0 and 1
     */
    getMax(min,max){
        let array = this.extractData(min,max);
        return Math.max( ...array)/255;
    }

    /**
     * 
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @param {Number} q - the quartile to get, between 0 and 1
     */
    getQuartile(min,max,q) {
        let array = this.extractData(min,max);
        array = Array_Sort_Numbers(array);
        var pos = ((array.length) - 1) * q;
        var base = Math.floor(pos);
        var rest = pos - base;
        if ((array[base + 1] !== undefined)) {
            return array[base] + rest * (array[base + 1] - array[base]);
        } else {
            return array[base];
        }

        function Array_Sort_Numbers(inputarray) {
            return inputarray.sort(function (a, b) {
                return a - b;
            });
        }
    }

    /**
     * Get a value representing the kick of the music
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @returns {Number}
     */
    getKick(min, max) {
        return this.getQuartile(min,max,0.75) / 255 + this.getQuartile(min,max,0.25) / 255;
    }

    /**
     * Returns true if a beat is detected
     * @param {Number} min - percentage of the low frequencies to ignore
     * @param {Number} max - percentage of the high frequencies to ignore
     * @returns {Boolean}
     */
    getBeat(min,max){
        let val = this.getKick(min,max);
        if(this.beat == 0 && val > 1.0){
            this.beat = 0.1;
            return true;
        }
        return false;
    }
}
    
  
   
      

   