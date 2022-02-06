import { useState, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router";
import MetronomSound from "../assets/4d.mp3";
import Loading from "../assets/loading.gif";
import CopyToClipboardSVG from "../assets/CopyToClipboard.svg";
import { Helmet } from "react-helmet";

// Render
import FixedBarsIndicator from "./FixedBarsIndicator";
import Bars from "./Bars";
import RecordingLength from "./RecordingLength";
import GridResize from "./GridResize";
import MuteSoloButtons from "./MuteSoloButtons";
import Clips from "./Clips";
import NavBar from "./NavBar";
import Drums from "./Drums";

// Drum Sounds
import KickSound from "../assets/DrumSounds/808/kick1.mp3";
import SnareSound from "../assets/DrumSounds/808/snare.mp3";
import CHHSound from "../assets/DrumSounds/808/cl_hihat.mp3";
import HCSound from "../assets/DrumSounds/808/handclap.mp3";
import OHHSound from "../assets/DrumSounds/808/open_hh.mp3";
import RIMSound from "../assets/DrumSounds/808/rimshot.mp3";

const Project = () => {
    // State & Hooks
    const [project, setProject] = useState({
        verified: false,
        isPlaying: false,
        isRecording: false,
        metronom: false,
        showInfo: false,
        recordWithPlayback: false,
        nameOfNewRecording: "",
        showAskToKeepRecording: false,
        showKeepLoading: false,
        cacheRecording: null,
        clipHeight: 80,
        quarterWidth: 80,
        gridResizeSteps: 20,
        showCreateLinkContainer: false,
        password: "",
        createdLink: null,
        loginPassword: null,
        wrongPassword: false,
        note: null,
        indicatorPosition: 0,
        showBloxs: false,
        recordDrums: false,
    });

    const { id } = useParams();

    // Refs
    const barsGridRef = useRef();
    const fixedBarsIndicatorRef = useRef();
    const trackContainerRef = useRef();
    const tracksRef = useRef();
    const MSRef = useRef();
    const indicatorRef = useRef();
    const recRef = useRef();
    const metronomContainerRef = useRef();
    const OneRef = useRef();
    const TwoRef = useRef();
    const ThreeRef = useRef();
    const FourRef = useRef();
    const FiveRef = useRef();
    const projectStateRef = useRef(project);
    const history = useHistory();
    const quarterCountRef = useRef(0);
    useEffect(() => {
        projectStateRef.current = project;
    });

    // Save Changes in LocalStorage
    const getLinksArray = () => {
        const arrayToStringify = project.quarterContent.map((current) => {
            if (current.length > 0) {
                return current.map((current) => {
                    if (current.sampleID) {
                        return {
                            name: current.sampleID,
                            sampleID: current.sampleID,
                            clip_id: current.clip_id,
                            durationInBars: current.durationInBars,
                            pbRate: current.pbRate,
                        };
                    } else {
                        return {
                            name: current.name,
                            clip_id: current.clip_id,
                            durationInBars: current.durationInBars,
                            link: current.link,
                            pbRate: current.pbRate,
                        };
                    }
                });
            } else {
                return [];
            }
        });
        return arrayToStringify;
    };
    const saveSessionLocally = () => {
        const arrayToStringify = getLinksArray();
        // Store Locally
        let sessionStorage = [];
        let storedSessions = localStorage.getItem("__local_sessions__");
        sessionStorage = JSON.parse(storedSessions);
        let sessionStorageWithoutCurrentSession = sessionStorage.filter(
            (current) => {
                if (current.sessionId !== project.sessionId) {
                    return current;
                }
            }
        );
        sessionStorageWithoutCurrentSession.push({
            sessionId: project.sessionId,
            name: project.name,
            tempo: project.tempo,
            trackLengthInBars: project.trackLengthInBars,
            timeSignature: project.timeSignature,
            nextClipId: project.nextClipId,
            audios: JSON.stringify(arrayToStringify),
            mutedClips: JSON.stringify(project.mutedClips),
            soloedClips: JSON.stringify(project.soloedClips),
        });
        const stringifiedSessionStorage = JSON.stringify(
            sessionStorageWithoutCurrentSession
        );
        localStorage.setItem("__local_sessions__", stringifiedSessionStorage);
    };
    const updateSession = async () => {
        const arrayToStringify = getLinksArray();
        const resp = await fetch("/session/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                nextClipId: project.nextClipId,
                audios: JSON.stringify(arrayToStringify),
                mutedClips: JSON.stringify(project.mutedClips),
                soloedClips: JSON.stringify(project.soloedClips),
            }),
        });
        const data = await resp.json();
        if (data.error) {
            setProject({
                ...project,
                note: {
                    class: "error",
                    note: "Something went wrong, please try again.",
                },
            });
        } else {
            setProject({
                ...project,
                note: {
                    class: "success",
                    note: "Session successfully updated.\nRemember to save it from time to time.",
                },
            });
        }
    };
    // Session Changed
    useEffect(() => {
        if (
            project.quarterContent &&
            project.quarterContent.length > 0 &&
            id.startsWith("local_")
        ) {
            return saveSessionLocally();
        }
    }, [project.quarterContent, project.mutedClips, project.soloedClips]);

    const initSession = (trackReference) => {
        console.log("trackReference :>> ", trackReference);
        // Set BarLength
        let barLength =
            (60 / trackReference.tempo) * trackReference.timeSignature;
        let trackLengthInQuarters =
            trackReference.trackLengthInBars * trackReference.timeSignature;
        let trackLengthInPixels = trackLengthInQuarters * project.quarterWidth;
        // Set TrackLengthInPixels
        document.documentElement.style.setProperty(
            "--track_width",
            `${trackLengthInPixels}px`
        );
        let setQuarterContent = [];
        trackReference.audios.forEach((current) => {
            if (current.length > 0) {
                let newQuarterArray = [];
                current.forEach((current) => {
                    if (current.sampleID) {
                        let setContent;
                        if (current.sampleID === "Kick") {
                            setContent = new Audio(KickSound);
                        } else if (current.sampleID === "Snare") {
                            setContent = new Audio(SnareSound);
                        } else if (current.sampleID === "CHH") {
                            setContent = new Audio(CHHSound);
                        } else if (current.sampleID === "HC") {
                            setContent = new Audio(HCSound);
                        } else if (current.sampleID === "OHH") {
                            setContent = new Audio(OHHSound);
                        } else if (current.sampleID === "RIM") {
                            setContent = new Audio(RIMSound);
                        }
                        newQuarterArray.push({
                            clip_id: current.clip_id,
                            name: current.sampleID,
                            sampleID: current.sampleID,
                            content: setContent,
                            durationInBars: current.durationInBars,
                            pbRate: current.pbRate || 1,
                        });
                    } else {
                        newQuarterArray.push({
                            clip_id: current.clip_id,
                            name: current.name,
                            content: new Audio(current.link),
                            link: current.link,
                            durationInBars: current.durationInBars,
                            pbRate: current.pbRate || 1,
                        });
                    }
                });
                setQuarterContent.push(newQuarterArray);
            } else {
                setQuarterContent.push(new Array());
            }
        });
        setProject({
            ...project,
            sessionId: trackReference.sessionId,
            verified: true,
            name: trackReference.name,
            tempo: trackReference.tempo,
            trackLengthInBars: trackReference.trackLengthInBars,
            timeSignature: trackReference.timeSignature,
            nextClipId: trackReference.nextClipId,
            mutedClips: trackReference.mutedClips || [],
            soloedClips: trackReference.soloedClips || [],
            lengthOfNewRecording: trackReference.trackLengthInBars / 2,
            maxLengthOfRecording: trackReference.trackLengthInBars,
            trackLengthInQuarters,
            barLength,
            quarterLength: 60 / trackReference.tempo,
            indicatorAnimation: `indicator_movement ${
                barLength * trackReference.trackLengthInBars
            }s infinite`,
            quarterContent: [...setQuarterContent],
            trackLengthInPixels,
            wrongPassword: false,
        });
    };

    // Move the Indicator
    const clickOnTrackContainer = (e) => {
        const tenVW = window.innerWidth / 10;
        let x = e.pageX - e.target.offsetLeft - tenVW;
        if (
            e.target.classList.contains("tracks") &&
            !project.isPlaying &&
            !project.isRecording &&
            !project.showInfo
        ) {
            const actualClickPositionInTrackContainer =
                trackContainerRef.current.scrollLeft + x;
            const newQuarterPosition = Math.floor(
                actualClickPositionInTrackContainer / project.quarterWidth
            );
            document.documentElement.style.setProperty(
                "--individual-indicator-left",
                `${newQuarterPosition * project.quarterWidth}px`
            );
            quarterCountRef.current = newQuarterPosition;
            setProject({
                ...project,
                indicatorPosition: newQuarterPosition,
            });
        }
    };
    const handleFixedBarsClick = (e) => {
        if (
            e.target.parentNode.classList.contains("bars") &&
            !project.isPlaying &&
            !project.isRecording &&
            !project.showInfo
        ) {
            const tenVW = window.innerWidth / 10;
            let x = e.pageX - e.target.offsetLeft - tenVW;
            const parent = e.target.parentNode;
            const index = Array.prototype.indexOf.call(
                parent.children,
                e.target
            );
            const actualClickPositionInTrackContainer =
                trackContainerRef.current.scrollLeft + x;
            const newQuarterPosition = Math.floor(
                actualClickPositionInTrackContainer / project.quarterWidth
            );
            const actualBar = index;
            const newNewQuarterPosition =
                actualBar * project.timeSignature + newQuarterPosition;
            document.documentElement.style.setProperty(
                "--individual-indicator-left",
                `${newNewQuarterPosition * project.quarterWidth}px`
            );
            quarterCountRef.current = newNewQuarterPosition;
            setProject({
                ...project,
                indicatorPosition: newNewQuarterPosition,
            });
        }
    };
    // Init useEffect
    useEffect(() => {
        if (project.verified) {
            // Set Bars Grid
            barsGridRef.current.style.gridTemplateColumns = `repeat(${
                project.trackLengthInBars
            }, ${project.quarterWidth * project.timeSignature}px)`;
            fixedBarsIndicatorRef.current.style.gridTemplateColumns = `repeat(${
                project.trackLengthInBars
            }, ${project.quarterWidth * project.timeSignature}px)`;
            document.addEventListener("keypress", handleKeyPress);
        }
    }, [project.verified]);

    // Styling
    useEffect(() => {
        if (project.trackLengthInBars && project.verified) {
            barsGridRef.current.style.gridTemplateColumns = `repeat(${
                project.trackLengthInBars
            }, ${project.quarterWidth * project.timeSignature}px)`;
            fixedBarsIndicatorRef.current.style.gridTemplateColumns = `repeat(${
                project.trackLengthInBars
            }, ${project.quarterWidth * project.timeSignature}px)`;
            document.documentElement.style.setProperty(
                "--track_width",
                `${project.trackLengthInQuarters * project.quarterWidth}px`
            );
        }
    }, [project.quarterWidth]);
    useEffect(() => {
        if (project.verified) {
            document.documentElement.style.setProperty(
                "--track_height",
                `${(project.clipHeight + 10) * project.nextClipId}px`
            );
            document.documentElement.style.setProperty(
                "--clip_height",
                `${project.clipHeight}px`
            );
        }
    }, [project.nextClipId, project.clipHeight, project.verified]);
    useEffect(() => {
        if (project.note) {
            setTimeout(() => {
                setProject({
                    ...project,
                    note: null,
                });
            }, 2500);
        }
    }, [project.note]);

    // Metronom & Recording
    let metronomSound = new Audio(MetronomSound);
    const countInTimeInMiliseconds = project.barLength * 1000 * 2 - 100;
    const setIndicatorAnimations = () => {
        const numberOfQuartersUntilEnd =
            project.trackLengthInQuarters -
            projectStateRef.current.indicatorPosition;
        const timeUntilEndInSeconds =
            numberOfQuartersUntilEnd * project.quarterLength;
        indicatorRef.current.style.animation = `frist_indicator_movement ${timeUntilEndInSeconds}s forwards linear`;
        setTimeout(() => {
            if (
                projectStateRef.current.isPlaying ||
                projectStateRef.current.isRecording
            ) {
                indicatorRef.current.style.animation = `${project.indicatorAnimation} linear`;
            }
        }, timeUntilEndInSeconds * 1000);
    };
    const count = () => {
        const one = window
                .getComputedStyle(OneRef.current)
                .getPropertyValue("display"),
            two = window
                .getComputedStyle(TwoRef.current)
                .getPropertyValue("display"),
            three = window
                .getComputedStyle(ThreeRef.current)
                .getPropertyValue("display"),
            four = window
                .getComputedStyle(FourRef.current)
                .getPropertyValue("display"),
            five = window
                .getComputedStyle(FiveRef.current)
                .getPropertyValue("display");
        if (
            one === "none" &&
            two === "none" &&
            three === "none" &&
            four === "none" &&
            five === "none"
        ) {
            OneRef.current.style.display = "block";
        } else if (
            one === "block" &&
            two === "none" &&
            three === "none" &&
            four === "none"
        ) {
            OneRef.current.style.display = "none";
            TwoRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "block" &&
            three === "none" &&
            four === "none"
        ) {
            TwoRef.current.style.display = "none";
            ThreeRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "none" &&
            three === "block" &&
            project.timeSignature === 3
        ) {
            ThreeRef.current.style.display = "none";
            OneRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "none" &&
            three === "block" &&
            four === "none"
        ) {
            ThreeRef.current.style.display = "none";
            FourRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "none" &&
            three === "none" &&
            four === "block" &&
            project.timeSignature === 4
        ) {
            FourRef.current.style.display = "none";
            OneRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "none" &&
            three === "none" &&
            four === "block"
        ) {
            FourRef.current.style.display = "none";
            FiveRef.current.style.display = "block";
        } else if (
            one === "none" &&
            two === "none" &&
            three === "none" &&
            four === "none" &&
            five === "block"
        ) {
            FiveRef.current.style.display = "none";
            OneRef.current.style.display = "block";
        }
    };
    const resetCount = () => {
        OneRef.current.style.display = "none";
        TwoRef.current.style.display = "none";
        ThreeRef.current.style.display = "none";
        FourRef.current.style.display = "none";
        FiveRef.current.style.display = "none";
    };
    const changeLengthOfNewRecording = (plus) => {
        if (
            plus &&
            !(
                project.lengthOfNewRecording * 4 + project.indicatorPosition >
                project.trackLengthInQuarters
            )
        ) {
            setProject({
                ...project,
                lengthOfNewRecording: (project.lengthOfNewRecording += 1),
            });
        } else if (!plus) {
            setProject({
                ...project,
                lengthOfNewRecording: (project.lengthOfNewRecording -= 1),
            });
        }
    };
    const getDuration = function (url, next) {
        var _player = new Audio(url);
        _player.addEventListener(
            "durationchange",
            function () {
                if (this.duration != Infinity) {
                    var duration = this.duration;
                    _player.remove();
                    next(duration);
                }
            },
            false
        );
        _player.load();
        _player.currentTime = 24 * 60 * 60;
        _player.volume = 0;
        _player.play();
    };
    const record = () => {
        let cacheIndicatorPositionBeforeRecording;
        const lengthOfNewRecordingInQuarters =
            project.lengthOfNewRecording * project.timeSignature;
        if (
            project.indicatorPosition + lengthOfNewRecordingInQuarters >
            project.trackLengthInQuarters
        ) {
            return setProject({
                ...project,
                note: {
                    class: "error",
                    note: "You can only record within the Session",
                },
            });
        }
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(async (stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                // Green CountColor
                metronomContainerRef.current.style.color = "var(--green)";
                setProject({
                    ...project,
                    isPlaying: false,
                    isRecording: true,
                    showInfo: false,
                    showAskToKeepRecording: false,
                    cacheRecording: null,
                    metronom: project.recordWithPlayback,
                });
                cacheIndicatorPositionBeforeRecording =
                    project.indicatorPosition;
                // CountIn Timeout
                await sleep(countInTimeInMiliseconds);
                // Start Recording
                mediaRecorder.start();
                // Animate Indicator
                setIndicatorAnimations();
                document.documentElement.style.setProperty(
                    "--rec_width",
                    `${
                        project.lengthOfNewRecording *
                        project.timeSignature *
                        project.quarterWidth
                    }px`
                );
                recRef.current.style.animation = `rec_growth ${
                    project.barLength * project.lengthOfNewRecording
                }s forwards`;
                recRef.current.style.animationTimingFunction = "linear";
                recRef.current.style.marginTop = `${
                    project.nextClipId * (project.clipHeight + 10)
                }px`;
                recRef.current.style.marginLeft = `${
                    project.indicatorPosition * project.quarterWidth
                }px`;
                recRef.current.style.height = `${project.clipHeight}px`;

                //
                // Width of Rec_Container
                metronomContainerRef.current.style.color = "var(--red)";

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", async () => {
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    stopPlaying();
                    recRef.current.style.width = "0%";
                    recRef.current.style.animation = "none";

                    // Ask to Keep it?!
                    getDuration(audioUrl, function (duration) {
                        const supposedDuration =
                            project.lengthOfNewRecording * project.barLength;
                        console.log("Differences in Durations");
                        console.log("duration :>> ", duration);
                        console.log("supposedDuration :>> ", supposedDuration);
                        console.log(supposedDuration - duration);
                        document.documentElement.style.setProperty(
                            "--individual-indicator-left",
                            `${
                                cacheIndicatorPositionBeforeRecording *
                                project.quarterWidth
                            }px`
                        );
                        quarterCountRef.current =
                            cacheIndicatorPositionBeforeRecording;
                        setProject({
                            ...project,
                            isPlaying: false,
                            isRecording: false,
                            showInfo: false,
                            showAskToKeepRecording: true,
                            indicatorPosition:
                                cacheIndicatorPositionBeforeRecording,
                            cacheRecording: {
                                clip_id: project.nextClipId,
                                name:
                                    project.nameOfNewRecording ||
                                    `Recording_${project.nextClipId}`,
                                content: audio,
                                durationInBars: project.lengthOfNewRecording,
                                pbRate: supposedDuration / duration,
                                contentBlob: audioBlob,
                            },
                        });
                    });
                });
                // Stop Recording
                setTimeout(() => {
                    mediaRecorder.stop();
                }, project.barLength * 1000 * project.lengthOfNewRecording + 101);
            });
    };
    const keep = async () => {
        setProject({
            ...project,
            showKeepLoading: true,
        });
        let newQuarterContent = [...project.quarterContent];

        // Create A Link an Store it locally
        const fd = new FormData();
        fd.append("file", project.cacheRecording.contentBlob, "loop.webm");
        const result = await fetch("/upload", {
            method: "POST",
            body: fd,
        });
        const data = await result.json();

        newQuarterContent[project.indicatorPosition].push({
            ...project.cacheRecording,
            link: data,
        });

        setProject({
            ...project,
            isPlaying: false,
            isRecording: false,
            showInfo: false,
            showAskToKeepRecording: false,
            quarterContent: [...newQuarterContent],
            cacheRecording: null,
            nameOfNewRecording: "",
            nextClipId: project.nextClipId + 1,
            showKeepLoading: false,
        });
    };

    // Intervals
    const playback = () => {
        if (
            projectStateRef.current.quarterContent[quarterCountRef.current] &&
            projectStateRef.current.quarterContent[quarterCountRef.current]
                .length > 0
        ) {
            projectStateRef.current.quarterContent[
                quarterCountRef.current
            ].forEach((current) => {
                if (
                    (projectStateRef.current.soloedClips.length > 0 &&
                        projectStateRef.current.soloedClips.indexOf(
                            current.clip_id
                        ) > -1) ||
                    (!projectStateRef.current.soloedClips.length &&
                        projectStateRef.current.mutedClips.indexOf(
                            current.clip_id
                        ) < 0)
                ) {
                    if (current.content) {
                        current.content.playbackRate = current.pbRate || 1;
                        current.content.currentTime = 0;
                        current.content.loop = false;
                        current.content.play();
                    }
                }
            });
        }
    };
    const innerQuarterIntervalPlaying = () => {
        if (projectStateRef.current.metronom) {
            if (
                !isNaN(metronomSound.duration) &&
                metronomSound.duration > project.quarterLength
            ) {
                metronomSound.playbackRate = 2;
            }
            metronomSound.play();
        }
        playback();
    };
    const innerQuarterIntervalRecording = () => {
        count();
        if (project.recordWithPlayback) {
            if (
                !isNaN(metronomSound.duration) &&
                metronomSound.duration > project.quarterLength
            ) {
                metronomSound.playbackRate = 2;
            }
            metronomSound.play();
            playback();
        }
    };
    useEffect(() => {
        if (project.isPlaying) {
            innerQuarterIntervalPlaying();
            const quarterInterval = setInterval(() => {
                quarterCountRef.current += 1;
                if (quarterCountRef.current >= project.quarterContent.length) {
                    quarterCountRef.current = 0;
                }
                innerQuarterIntervalPlaying();
            }, project.quarterLength * 1000);
            return () => clearInterval(quarterInterval);
        }
    }, [project.isPlaying]);
    useEffect(() => {
        if (project.isRecording) {
            let countInOver = true;
            // Play everything when just Play is pressed
            if (project.recordWithPlayback) {
                countInOver = false;
                setTimeout(() => {
                    countInOver = true;
                }, countInTimeInMiliseconds);
            }
            innerQuarterIntervalRecording();
            const quarterInterval = setInterval(() => {
                if (countInOver) {
                    quarterCountRef.current += 1;
                    if (
                        quarterCountRef.current >= project.quarterContent.length
                    ) {
                        quarterCountRef.current = 0;
                    }
                }
                innerQuarterIntervalRecording();
            }, project.quarterLength * 1000);
            return () => clearInterval(quarterInterval);
        }
    }, [project.isRecording]);
    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Functions
    const handleMute = (e) => {
        const fullId = e.target.parentNode.id;
        const onlyTheId = fullId.substring(fullId.length - 1, fullId.length);
        if (project.mutedClips.indexOf(+onlyTheId) > -1) {
            let newMutedClips = [...project.mutedClips];
            newMutedClips.splice(project.mutedClips.indexOf(+onlyTheId), 1);
            setProject({
                ...project,
                mutedClips: [...newMutedClips],
            });
        } else {
            let newMutedClips = [...project.mutedClips];
            newMutedClips.push(+onlyTheId);
            setProject({
                ...project,
                mutedClips: [...newMutedClips],
            });
        }
    };
    const handleSolo = (e) => {
        const fullId = e.target.parentNode.id;
        const onlyTheId = fullId.substring(fullId.length - 1, fullId.length);
        if (project.soloedClips.indexOf(+onlyTheId) > -1) {
            let newsoloedClips = [...project.soloedClips];
            newsoloedClips.splice(project.soloedClips.indexOf(+onlyTheId), 1);
            setProject({
                ...project,
                soloedClips: [...newsoloedClips],
            });
        } else {
            let newsoloedClips = [...project.soloedClips];
            newsoloedClips.push(+onlyTheId);
            setProject({
                ...project,
                soloedClips: [...newsoloedClips],
            });
        }
    };
    const handleTracksScroll = (e) => {
        // console.log(MSRef.current);
        if (e.target.scrollTop > 0) {
            MSRef.current.style.transform = `translateY(-${e.target.scrollTop}px)`;
        }
        if (e.target.scrollLeft > 0) {
            fixedBarsIndicatorRef.current.scrollLeft = e.target.scrollLeft;
        } else if (e.target.scrollLeft < 1) {
            fixedBarsIndicatorRef.current.scrollLeft = 0;
        }
    };

    // Grid Resize
    const changeClipSize = (axis) => {
        if (axis === "y_plus" && projectStateRef.current.clipHeight < 200) {
            setProject({
                ...project,
                clipHeight:
                    projectStateRef.current.clipHeight +
                    project.gridResizeSteps,
            });
        } else if (
            axis === "y_minus" &&
            project.clipHeight > project.gridResizeSteps * 3
        ) {
            setProject({
                ...project,
                clipHeight: project.clipHeight - project.gridResizeSteps,
            });
        } else if (axis === "x_plus" && project.quarterWidth < 300) {
            let newQuarterWidth =
                project.quarterWidth + project.gridResizeSteps;
            document.documentElement.style.setProperty(
                "--individual-indicator-left",
                `${project.indicatorPosition * newQuarterWidth}px`
            );
            setProject({
                ...project,
                quarterWidth: newQuarterWidth,
                trackLengthInPixels:
                    project.trackLengthInQuarters * newQuarterWidth,
            });
        } else if (axis === "x_minus" && project.quarterWidth > 40) {
            let newQuarterWidth =
                project.quarterWidth - project.gridResizeSteps;
            document.documentElement.style.setProperty(
                "--individual-indicator-left",
                `${project.indicatorPosition * newQuarterWidth}px`
            );
            setProject({
                ...project,
                quarterWidth: newQuarterWidth,
                trackLengthInPixels:
                    project.trackLengthInQuarters * newQuarterWidth,
            });
        }
    };

    // changeProjectState
    const changeProjectState = (state) => {
        setProject({
            ...project,
            ...state,
        });
    };

    // NavBar Functions
    const play = () => {
        // setProject
        setProject({
            ...project,
            isPlaying: true,
            isRecording: false,
            showInfo: false,
        });
        setIndicatorAnimations();
    };
    const stopPlaying = () => {
        project.quarterContent.forEach((current) => {
            if (current.length > 0) {
                current.forEach((current) => {
                    if (current.content) {
                        current.content.pause();
                    }
                });
            }
        });
        document.documentElement.style.setProperty(
            "--individual-indicator-left",
            `${quarterCountRef.current * project.quarterWidth}px`
        );
        setProject({
            ...project,
            isPlaying: false,
            isRecording: false,
            indicatorPosition: quarterCountRef.current,
        });
        // quarterCountRef.current = project.indicatorPosition;
        // Animate Indicator
        indicatorRef.current.style.animation = "none";
        setTimeout(() => {
            resetCount();
        }, 200);
    };

    // Create Link
    const changeSessionFromLocalToCloud = (createdId) => {
        // Remove From Local
        let sessionStorage = [];
        let storedSessions = localStorage.getItem("__local_sessions__");
        sessionStorage = JSON.parse(storedSessions);
        let sessionStorageWithoutCurrentSession = sessionStorage.filter(
            (current) => {
                if (current.sessionId !== project.sessionId) {
                    return current;
                }
            }
        );
        const stringifiedSessionStorage = JSON.stringify(
            sessionStorageWithoutCurrentSession
        );
        localStorage.setItem("__local_sessions__", stringifiedSessionStorage);
        // Save sessionId & name to __cloud_sessions__
        let cloudSessionStorage = [];
        let storedCloudSessions = localStorage.getItem("__cloud_sessions__");

        let newSession = {
            name: project.name,
            sessionId: createdId,
        };
        if (storedCloudSessions) {
            cloudSessionStorage = JSON.parse(storedCloudSessions);
        }
        cloudSessionStorage.push(newSession);
        const stringifiedCloudSessionStorage =
            JSON.stringify(cloudSessionStorage);
        localStorage.setItem(
            "__cloud_sessions__",
            stringifiedCloudSessionStorage
        );
        history.push(`/project/${createdId}`);
    };
    const createLink = () => {
        const arrayToStringify = getLinksArray();
        fetch("/session/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: project.name || "New Session",
                tempo: project.tempo,
                trackLengthInBars: project.trackLengthInBars,
                timeSignature: project.timeSignature,
                nextClipId: project.nextClipId,
                audios: JSON.stringify(arrayToStringify),
                mutedClips: JSON.stringify(project.mutedClips),
                soloedClips: JSON.stringify(project.soloedClips),
                password: project.password,
            }),
        })
            .then((resp) => resp.json())
            .then((data) => {
                if (data.error) {
                    setProject({
                        ...project,
                        note: {
                            class: "error",
                            note: "Something went wrong, please try again.",
                        },
                    });
                } else {
                    // setProject
                    setProject({
                        ...project,
                        password: "",
                        createdLink: data,
                    });
                    changeSessionFromLocalToCloud(data);
                }
            });
    };
    const copyLink = (str) => {
        navigator.clipboard
            .writeText(str)
            .then(() => {
                setProject({
                    ...project,
                    showCreateLinkContainer: false,
                    note: {
                        class: "success",
                        note: "Link copied to clipboard.",
                    },
                });
            })
            .catch(() => {
                setProject({
                    ...project,
                    note: {
                        class: "error",
                        note: "Something went wrong, please try again.",
                    },
                });
            });
    };

    // Verification
    const verifyRequest = async () => {
        const resp = await fetch("/session/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                password: project.loginPassword,
            }),
        });
        const data = await resp.json();
        if (data.sessionid) {
            let sessionStorage = [];
            let storedSessions = localStorage.getItem("__cloud_sessions__");
            if (storedSessions) {
                sessionStorage = JSON.parse(storedSessions);
            }
            sessionStorage.push({
                name: data.name,
                sessionId: data.sessionid,
            });
            const stringifiedSessionStorage = JSON.stringify(sessionStorage);
            localStorage.setItem(
                "__cloud_sessions__",
                stringifiedSessionStorage
            );
            const parsedAudios = JSON.parse(data.audios);
            const parsedMutedClips = JSON.parse(data.mutedclips);
            const parsedSoloedClips = JSON.parse(data.soloedclips);
            initSession({
                sessionId: data.sessionid,
                name: data.name,
                tempo: data.tempo,
                trackLengthInBars: data.tracklengthinbars,
                timeSignature: data.timesignature,
                nextClipId: data.nextclipid,
                audios: parsedAudios,
                mutedClips: parsedMutedClips,
                soloedClips: parsedSoloedClips,
            });
        } else {
            setProject({
                ...project,
                wrongPassword: true,
            });
        }
    };
    const loadAndOpenSession = async (id) => {
        const resp = await fetch("/session/load", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
            }),
        });
        const data = await resp.json();
        if (data.error) {
            setProject({
                ...project,
                note: {
                    class: "error",
                    note: "Something went wrong, please try again.",
                },
            });
        } else {
            const parsedAudios = JSON.parse(data.audios);
            const parsedMutedClips = JSON.parse(data.mutedclips);
            const parsedSoloedClips = JSON.parse(data.soloedclips);
            initSession({
                sessionId: data.sessionid,
                name: data.name,
                tempo: data.tempo,
                trackLengthInBars: data.tracklengthinbars,
                timeSignature: data.timesignature,
                nextClipId: data.nextclipid,
                audios: parsedAudios,
                mutedClips: parsedMutedClips,
                soloedClips: parsedSoloedClips,
            });
        }
    };
    useEffect(() => {
        if (id.startsWith("local_")) {
            // Get Session out of LocalStorage
            const storedLocalSessions =
                localStorage.getItem("__local_sessions__");
            const parsedLocalSessions = JSON.parse(storedLocalSessions);
            parsedLocalSessions.forEach((current) => {
                if (current.sessionId === id) {
                    if (typeof current.audios === "string") {
                        const parsedAudios = JSON.parse(current.audios);
                        let parsedMutedClips;
                        let parsedSoloedClips;
                        try {
                            parsedMutedClips = JSON.parse(current.mutedclips);
                            parsedSoloedClips = JSON.parse(current.soloedclips);
                        } catch {
                            parsedMutedClips = [];
                            parsedSoloedClips = [];
                        }
                        initSession({
                            sessionId: current.sessionId,
                            name: current.name,
                            tempo: current.tempo,
                            trackLengthInBars: current.trackLengthInBars,
                            timeSignature: current.timeSignature,
                            nextClipId: current.nextClipId,
                            audios: parsedAudios,
                            mutedClips: parsedMutedClips,
                            soloedClips: parsedSoloedClips,
                        });
                    } else {
                        initSession(current);
                    }
                }
            });
        } else {
            const storedCloudSessions =
                localStorage.getItem("__cloud_sessions__");
            const parsedCloudSessions = JSON.parse(storedCloudSessions);
            if (parsedCloudSessions && parsedCloudSessions.length > 0) {
                let sessionIdIsInCloudSessions = false;
                parsedCloudSessions.forEach((current) => {
                    if (current.sessionId === id) {
                        sessionIdIsInCloudSessions = true;
                    }
                });
                if (sessionIdIsInCloudSessions) {
                    loadAndOpenSession(id);
                }
            }
        }
    }, []);
    if (!project.verified) {
        return (
            <div className="verification_container">
                <h1>
                    enter a <span>session</span>
                </h1>
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter the Password..."
                        onChange={(e) =>
                            setProject({
                                ...project,
                                loginPassword: e.target.value,
                            })
                        }
                    />
                    {project.wrongPassword && <p>Wrong Password</p>}
                    <button
                        id="keep"
                        onClick={verifyRequest}
                        disabled={!project.loginPassword}
                    >
                        Go To Session
                    </button>
                </div>
            </div>
        );
    }

    // Drums
    const handleDrumHit = (sampleID) => {
        let setAudio;
        if (sampleID === "Kick") {
            setAudio = new Audio(KickSound);
            setAudio.play();
        } else if (sampleID === "Snare") {
            setAudio = new Audio(SnareSound);
            setAudio.play();
        } else if (sampleID === "CHH") {
            setAudio = new Audio(CHHSound);
            setAudio.play();
        } else if (sampleID === "HC") {
            setAudio = new Audio(HCSound);
            setAudio.play();
        } else if (sampleID === "OHH") {
            setAudio = new Audio(OHHSound);
            setAudio.play();
        } else if (sampleID === "RIM") {
            setAudio = new Audio(RIMSound);
            setAudio.play();
        }
        if (projectStateRef.current.recordDrums) {
            let sampleIsAlreadyOnRThatQuarter;
            let selectedClipId;
            if (
                projectStateRef.current.quarterContent[quarterCountRef.current]
                    .length > 0
            ) {
                projectStateRef.current.quarterContent[
                    quarterCountRef.current
                ].forEach((current) => {
                    if (current.sampleID && current.sampleID === sampleID) {
                        sampleIsAlreadyOnRThatQuarter = true;
                    }
                });
            }
            if (!sampleIsAlreadyOnRThatQuarter) {
                projectStateRef.current.quarterContent.forEach((current) => {
                    if (current.length > 0) {
                        current.forEach((current) => {
                            if (
                                current.sampleID &&
                                current.sampleID === sampleID
                            ) {
                                selectedClipId = current.clip_id;
                            }
                        });
                    }
                });
                console.log(selectedClipId);
                // Are there already Clips with that sampleID
                let newQuarterContent = [...project.quarterContent];
                if (selectedClipId || selectedClipId === 0) {
                    newQuarterContent[quarterCountRef.current].push({
                        clip_id: selectedClipId,
                        name: sampleID,
                        sampleID,
                        content: setAudio,
                        durationInBars: 0.25,
                        pbRate: 1,
                    });
                    setProject({
                        ...project,
                        quarterContent: [...newQuarterContent],
                    });
                } else {
                    newQuarterContent[quarterCountRef.current].push({
                        clip_id: project.nextClipId,
                        name: sampleID,
                        sampleID,
                        content: setAudio,
                        durationInBars: 0.25,
                        pbRate: 1,
                    });
                    setProject({
                        ...project,
                        quarterContent: [...newQuarterContent],
                        nextClipId: project.nextClipId + 1,
                    });
                }
            }
        }
    };
    const handleKeyPress = (e) => {
        console.log("KeyPress", e.keyCode);
        if (e.keyCode === 49 && projectStateRef.current.showBloxs) {
            handleDrumHit("Kick");
        } else if (e.keyCode === 50 && projectStateRef.current.showBloxs) {
            handleDrumHit("Snare");
        } else if (e.keyCode === 51 && projectStateRef.current.showBloxs) {
            handleDrumHit("CHH");
        } else if (e.keyCode === 52 && projectStateRef.current.showBloxs) {
            handleDrumHit("HC");
        } else if (e.keyCode === 53 && projectStateRef.current.showBloxs) {
            handleDrumHit("OHH");
        } else if (e.keyCode === 54 && projectStateRef.current.showBloxs) {
            handleDrumHit("RIM");
        }
    };

    // Return
    return (
        <>
            <Helmet>
                <title>
                    {project.name || "Open Loop Session"} - A Bloxs Session
                </title>
            </Helmet>
            {/* Track */}
            <div
                className="track_container"
                ref={trackContainerRef}
                onScroll={handleTracksScroll}
                onClick={handleFixedBarsClick}
            >
                <div id="indicator" ref={indicatorRef}></div>
                <div
                    className="fixed_bars_indicator"
                    ref={fixedBarsIndicatorRef}
                >
                    <FixedBarsIndicator
                        trackLengthInBars={project.trackLengthInBars}
                        timeSignature={project.timeSignature}
                    />
                </div>
                {true && (
                    <div className="bars individual_bars" ref={barsGridRef}>
                        <Bars trackLengthInBars={project.trackLengthInBars} />
                    </div>
                )}
                <div
                    className="tracks"
                    ref={tracksRef}
                    onClick={clickOnTrackContainer}
                >
                    <Clips
                        quarterContent={project.quarterContent || []}
                        clipHeight={project.clipHeight}
                        quarterWidth={project.quarterWidth}
                        trackLengthInQuarters={project.trackLengthInQuarters}
                        nextClipId={project.nextClipId}
                        changeProjectState={changeProjectState}
                        timeSignature={project.timeSignature}
                    />
                    <div id="rec" ref={recRef}>
                        <p>Rec...</p>
                    </div>
                </div>
            </div>
            {/* Metronom Container */}
            <div ref={metronomContainerRef} className="metronom_container">
                <h1 ref={OneRef}>1</h1>
                <h1 ref={TwoRef}>2</h1>
                <h1 ref={ThreeRef}>3</h1>
                <h1 ref={FourRef}>4</h1>
                <h1 ref={FiveRef}>5</h1>
            </div>
            {project.showCreateLinkContainer && (
                <div className="create_link_container">
                    {!project.createdLink && (
                        <>
                            <input
                                type="password"
                                name="password"
                                placeholder="Give your Session a Password..."
                                onChange={(e) =>
                                    setProject({
                                        ...project,
                                        password: e.target.value,
                                    })
                                }
                            />
                            <button
                                disabled={!project.password}
                                id="keep"
                                onClick={createLink}
                            >
                                Create A Link
                            </button>
                        </>
                    )}
                    {project.createdLink && (
                        <div className="copy_link">
                            <p>
                                https://bloxs-app.herokuapp.com/project/
                                {project.createdLink}
                            </p>
                            <img
                                src={CopyToClipboardSVG}
                                onClick={() =>
                                    copyLink(
                                        `https://bloxs-app.herokuapp.com/project/${project.createdLink}`
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            )}
            <NavBar
                changeProjectState={changeProjectState}
                metronom={project.metronom}
                showInfo={project.showInfo}
                isRecording={project.isRecording}
                isPlaying={project.isPlaying}
                play={play}
                stopPlaying={stopPlaying}
                showCreateLinkContainer={project.showCreateLinkContainer}
                sessionId={id}
                updateSession={updateSession}
                quarterContent={project.quarterContent}
                indicatorPosition={project.indicatorPosition}
                trackLengthInQuarters={project.trackLengthInQuarters}
                showBloxs={project.showBloxs}
                timeSignature={project.timeSignature}
                lengthOfNewRecording={project.lengthOfNewRecording}
            />
            <GridResize
                isPlaying={project.isPlaying}
                isRecording={project.isRecording}
                changeClipSize={changeClipSize}
            />
            <div className="ms_container" ref={MSRef}>
                <MuteSoloButtons
                    nextClipId={project.nextClipId}
                    clipHeight={project.clipHeight}
                    mutedClips={project.mutedClips}
                    soloedClips={project.soloedClips}
                    handleMute={handleMute}
                    handleSolo={handleSolo}
                />
            </div>
            {project.note && (
                <div className={`note ${project.note.class}`}>
                    <p>{project.note.note}</p>
                </div>
            )}
            {project.showBloxs && (
                <Drums
                    handleDrumHit={handleDrumHit}
                    changeProjectState={changeProjectState}
                    recordDrums={project.recordDrums}
                />
            )}
            {(project.showInfo || project.showAskToKeepRecording) && (
                <>
                    <div className="new_recording_wrapper">
                        {project.showInfo && (
                            <section>
                                <div className="newrecording_info_container">
                                    <input
                                        type="text"
                                        name="rec_name"
                                        placeholder="Type in Name..."
                                        onChange={(e) =>
                                            setProject({
                                                ...project,
                                                nameOfNewRecording:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                    <div className="playback_container">
                                        <div>
                                            <p>Record with Playback?</p>
                                            <p>
                                                (Recommend when you have
                                                headphones on)
                                            </p>
                                        </div>
                                        <div
                                            className={`toggle ${
                                                project.recordWithPlayback
                                                    ? "right"
                                                    : "left"
                                            }`}
                                            onClick={() =>
                                                setProject({
                                                    ...project,
                                                    recordWithPlayback:
                                                        !project.recordWithPlayback,
                                                })
                                            }
                                        >
                                            <div></div>
                                        </div>
                                    </div>
                                    <div className="recording_length_container">
                                        <div>
                                            <p>Record how many Bars?</p>
                                            <p>
                                                (Recording stops automatically)
                                            </p>
                                        </div>
                                        <div className="length">
                                            <RecordingLength
                                                plus={false}
                                                trackLengthInBars={
                                                    project.trackLengthInBars
                                                }
                                                lengthOfNewRecording={
                                                    project.lengthOfNewRecording
                                                }
                                                changeLengthOfNewRecording={
                                                    changeLengthOfNewRecording
                                                }
                                                maxLengthOfRecording={
                                                    project.maxLengthOfRecording
                                                }
                                            />
                                            <p>
                                                {project.lengthOfNewRecording}{" "}
                                                Bars
                                            </p>
                                            <RecordingLength
                                                plus={true}
                                                trackLengthInBars={
                                                    project.trackLengthInBars
                                                }
                                                lengthOfNewRecording={
                                                    project.lengthOfNewRecording
                                                }
                                                changeLengthOfNewRecording={
                                                    changeLengthOfNewRecording
                                                }
                                                maxLengthOfRecording={
                                                    project.maxLengthOfRecording
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button id="begin_recording" onClick={record}>
                                    Begin Recording
                                    <br />
                                    <span>2 Bars Count in</span>
                                </button>
                                <button
                                    id="cancel"
                                    onClick={() => {
                                        setProject({
                                            ...project,
                                            showInfo: !project.showInfo,
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </section>
                        )}
                        {project.showAskToKeepRecording && (
                            <section className="keep_retry">
                                <button
                                    id="keep"
                                    onClick={keep}
                                    disabled={project.showKeepLoading}
                                >
                                    {project.showKeepLoading ? (
                                        <img src={Loading} />
                                    ) : (
                                        "Keep It"
                                    )}
                                </button>
                                {!project.showKeepLoading && (
                                    <button id="retry" onClick={record}>
                                        Retry
                                    </button>
                                )}
                            </section>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Project;
