

// video.js allows ESM module importing, but exposes a `videojs()` global in the `window`
import "/static/imports/videojs/video.min.js";


function padZeros(number) {
    return String(number).padStart(2, "0");
}

function secondsToTimestamp(s) {
    const minutes = padZeros(Math.floor(s / 60));
    const seconds = padZeros(Math.floor(s % 60));
    const milliseconds = padZeros(Math.floor((s % 1) * 100));
    
    
    
    return `${minutes}:${seconds}.${milliseconds}`
}

class VideoStopwatch {
    
    maybeRemove(selector) {
        let el = this.container.el(selector);
        if(el) el.remove();
    }
    
    openHomePage() {
        this.container.addc("hide-back-button");
        this.container.attr("page", "home");
        
        this.maybeRemove(".stopwatch-home");
        this.container
            .crel("div").addc("stopwatch-home")
                .crel("h2")
                    .txt("What are we timing?")
                .prnt()
                .crel("button")
                    .txt("Record with Camera")
                    .on("click", () => {
                        this.openRecordPage();
                    })
                .prnt()
                .crel("button")
                    .txt("Import from File")
                    .on("click", () => {
                        this.openImportPage();
                    })
                .prnt()
    }
    
    async openRecordPage() {
        this.container.addc("hide-back-button");
        this.container.attr("page", "record");
        
        this.maybeRemove(".stopwatch-record");
        this.maybeRemove(".stopwatch-error");
        
        
        const page = this.container.crel("div")
        const cameraSetupFail = err => {
            
            page.addc("stopwatch-error")
                .crel("p").txt("Unable to set up camera.").prnt()
                .crel("p").txt("Technical info: ").crel("i").txt(`"${err}"`).prnt().prnt()
                .crel("button")
                    .txt("Go Back")
                    .on("click", () => this.openHomePage())
                .prnt();
            
            throw err; // don't continue setting up record page
        }
        
        if(!navigator.mediaDevices)
            cameraSetupFail("Site is not allowed to access cameras.");
        
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        
        if(!mediaDevices.some(device => device.kind == "videoinput"))
            cameraSetupFail("No camera detected.");
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                frameRate: {ideal: 60, max: 60}
            },
            audio: mediaDevices.some(device => device.kind == "audioinput")
        }).catch(err => {
            cameraSetupFail(err.message);
        });
        
        this.container.remc("hide-back-button");
        page.addc("stopwatch-record");
        
        const playback = page.crel("video");
        
        playback.srcObject = mediaStream;
        playback.muted = true;
        playback.playsinline = true;
        playback.onloadedmetadata = () => playback.play();
        
        const camCheckInterval = setInterval(() => {
            if(this.container.attr("page") !== "record") {
                mediaStream.getTracks().forEach(track => track.stop());
                clearInterval(camCheckInterval);
            }
        }, 100);
        
        
        const buttonContainer = page.crel("div").addc("record-buttons");
        
        const recordingStart = () => {
            // the references in this method are bugging me a little since they're defined later on,
            // but there aren't any errors here, so whatever i guess
            
            const recordedChunks = [];
            const recorder = new MediaRecorder(mediaStream);
            recorder.ondataavailable = (event) => {
                if(event.data.size > 0)
                    recordedChunks.push(event.data)
            }
            recorder.start();
            
            const recordingEnd = (save = true) => {
                
                recordButton.html("Start Recording");
                recordButton.onclick = recordingStart;
                
                cancelButton.style.display = "none";
                
                buttonContainer.style.pointerEvents = "none";
                recorder.stop();
                
                recorder.onstop = () => {
                    buttonContainer.style.pointerEvents = "";
                    
                    if(save) {
                        const recordedBlob = new Blob(recordedChunks);
                        this.openVideoPage(URL.createObjectURL(recordedBlob));
                    }
                }
                
            }
            
            const recordingCancel = () => {
                recordingEnd(false);
            }
            
            recordButton.html("End Recording and Continue")
            recordButton.onclick = recordingEnd;
            cancelButton.style.display = "";
            cancelButton.onclick = recordingCancel;
            
        }
        
        
        const recordButton = buttonContainer
            .crel("button")
                .txt("Start Recording");
        
        recordButton.onclick = recordingStart;
        
        const cancelButton = buttonContainer
            .crel("button")
                .txt("Reset Recording")
        
        cancelButton.style.display = "none";
    }
    
    openImportPage() {
        this.container.remc("hide-back-button");
        this.container.attr("page", "import");
        
        this.maybeRemove(".stopwatch-import");
        
        this.container.crel("div").addc("stopwatch-import")
            .crel("p").txt("This will be added later. Sorry!").prnt();
    }
    
    openVideoPage(source) {
        this.container.remc("hide-back-button");
        this.container.attr("page", "video");
        
        this.maybeRemove(".stopwatch-video");
        
        const page = this.container
            .crel("div").addc("stopwatch-video");
        
        const page_top = page
            .crel("div").addc("video-top");
        
        const page_buttons = page
            .crel("div").addc("video-buttons");
        
        const stopwatch_container = page_top.crel("div").addc("stopwatch");
        const stopwatch = stopwatch_container.crel("div").addc("stopwatch-main");
        const stopwatch_details = stopwatch_container.crel("div").addc("stopwatch-details");
        
        
            
        const playback = page_top.crel("video");
        
        playback.src = source;
        playback.disablePictureInPicture = true;
        
        window.vjs_debug = videojs(playback.addc("video-js"), {
            controls: true,
            preload: "auto",
            enableSmoothSeeking: true,
            userActions: {
                doubleClick: false
            },
            controlBar: {
                fullscreenToggle: false,
                volume: false
            }
        });
        
        let stopwatchStartTime = null;
        let stopwatchEndTime = null;
        
        const stopwatchSetStartTime = () => {
            stopwatchStartTime = playback.currentTime;
            if(stopwatchEndTime < stopwatchStartTime)
                stopwatchEndTime = null;
        }
        const stopwatchSetEndTime = () => {
            stopwatchEndTime = playback.currentTime;
            if(stopwatchEndTime < stopwatchStartTime)
                stopwatchStartTime = null;
        }
        
        page_buttons
            .crel("button")
                .txt("Set Stopwatch Start Frame")
                .on("click", () => stopwatchSetStartTime())
            .prnt();
        
        const currentTime = page_buttons.crel("div").addc("current-time");
        
        page_buttons
            .crel("button")
                .txt("Set Stopwatch End Frame")
                .on("click", () => stopwatchSetEndTime())
            .prnt()
        
        let last_blink = 0;
        let last_blink_state = "off";
        const stopwatchInterval = setInterval(() => {
            if(this.container.attr("page") !== "video") {
                clearInterval(stopwatchInterval);
                return false;
            }
            
            
            let segment_length = null;
            if(stopwatchStartTime !== null && stopwatchEndTime !== null)
                segment_length = stopwatchEndTime - stopwatchStartTime;
            
            let stopwatch_time_seconds =
                Math.max(
                    0,
                    Math.min(
                        playback.currentTime - stopwatchStartTime,
                        stopwatchEndTime - stopwatchStartTime
                    )
                );
            if(!stopwatch_time_seconds) {
                stopwatch_time_seconds = 0;
            }
            
            stopwatch.html("");
            stopwatch.txt(secondsToTimestamp(stopwatch_time_seconds));
            if(stopwatch_time_seconds == 0 || stopwatch_time_seconds == segment_length) {
                if(Date.now() - last_blink > 500) {
                    if(last_blink_state == "on") {
                        stopwatch.style.opacity = "0.5";
                        last_blink_state = "off";
                    } else {
                        stopwatch.style.opacity = "0.8";
                        last_blink_state = "on";
                    }
                    last_blink = Date.now();
                }
            } else {
                stopwatch.style.opacity = "";
                last_blink = 0;
                last_blink_state = "on";
            }
            
            stopwatch_details.html("")
                .crel("span")
                    .txt('Start Frame : ')
                    .txt(stopwatchStartTime === null ? "Not set" : secondsToTimestamp(stopwatchStartTime))
                .prnt()
                .crel("span")
                    .txt('End Frame   : ')
                    .txt(stopwatchEndTime === null ? "Not set" : secondsToTimestamp(stopwatchEndTime))
                .prnt()
                .crel("span")
                    .txt("Segment Time: ")
                    .txt(segment_length === null ? "..." : secondsToTimestamp(segment_length))
                .prnt()
            currentTime.html("").txt(secondsToTimestamp(playback.currentTime));
        }, 10)
        
    }
    
    constructor(container) {
        container.addc("video-stopwatch");
        container.crel("div")
            .addc("back-button")
            .txt("<- Return")
            .on("click", () => {
                const currentPage = container.attr("page");
                
                if(currentPage == "video")
                    this.openRecordPage();
                
                if(
                    currentPage == "record" ||
                    currentPage == "import"
                )
                    this.openHomePage();
                
            })
        this.container = container;
        
        this.openHomePage();
    }
}

export default VideoStopwatch;