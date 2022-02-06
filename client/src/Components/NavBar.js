import MetronomSVG from "../assets/Metronom.svg";
import NoMetronomSVG from "../assets/NoMetronom.svg";
import PlaySVG from "../assets/Play.svg";
import ShareSVG from "../assets/Share.svg";
import SaveSVG from "../assets/Save.svg";
import HomeSVG from "../assets/Home.svg";
import GreyPlaySVG from "../assets/GreyPlay.svg";
import StopSVG from "../assets/Stop.svg";
import RecSVG from "../assets/Rec.svg";
import BloxsSVG from "../assets/Logo.svg";

const NavBar = ({
    metronom,
    changeProjectState,
    showInfo,
    isRecording,
    isPlaying,
    play,
    stopPlaying,
    showCreateLinkContainer,
    sessionId,
    updateSession,
    quarterContent,
    indicatorPosition,
    trackLengthInQuarters,
    showBloxs,
    timeSignature,
    lengthOfNewRecording,
}) => {
    const toggleMetronom = () => {
        changeProjectState({
            metronom: !metronom,
        });
    };
    const toggleShowInfo = () => {
        if (isPlaying) {
            stopPlaying();
        }
        if (trackLengthInQuarters - indicatorPosition < timeSignature) {
            changeProjectState({
                note: {
                    class: "error",
                    note: "You can not record from that position.",
                },
            });
        } else {
            if (!showInfo && indicatorPosition > 0) {
                const newLengthOfNewRecording = Math.floor(
                    (trackLengthInQuarters - indicatorPosition) / 4
                );
                if (lengthOfNewRecording > newLengthOfNewRecording) {
                    changeProjectState({
                        isPlaying: false,
                        showInfo: !showInfo,
                        showBloxs: false,
                        maxLengthOfRecording: newLengthOfNewRecording,
                        lengthOfNewRecording: newLengthOfNewRecording,
                    });
                } else {
                    changeProjectState({
                        isPlaying: false,
                        showInfo: !showInfo,
                        showBloxs: false,
                        maxLengthOfRecording: newLengthOfNewRecording,
                    });
                }
            } else {
                changeProjectState({
                    isPlaying: false,
                    showBloxs: false,
                    showInfo: !showInfo,
                });
            }
        }
    };
    const toggleCreateLinkContainer = () => {
        let areThereRecordingsInTheSession = false;
        quarterContent.forEach((current) => {
            if (current.length > 0) {
                areThereRecordingsInTheSession = true;
            }
        });
        if (areThereRecordingsInTheSession) {
            changeProjectState({
                showCreateLinkContainer: !showCreateLinkContainer,
            });
        } else {
            changeProjectState({
                note: {
                    class: "error",
                    note: "Session Needs Clips to be uploaded.",
                },
            });
        }
    };
    const toggleBloxsContainer = () => {
        changeProjectState({
            showBloxs: !showBloxs,
        });
    };
    return (
        <div className="nav_bar">
            <div onClick={() => (window.location.href = "/")}>
                <img src={HomeSVG} alt="Home Icon" />
            </div>
            <div onClick={toggleBloxsContainer}>
                <img src={BloxsSVG} alt="Home Icon" />
            </div>
            {sessionId.startsWith("local_") && (
                <div onClick={toggleCreateLinkContainer}>
                    <img src={ShareSVG} alt="Share Icon" />
                </div>
            )}
            {!sessionId.startsWith("local_") && (
                <div onClick={updateSession}>
                    <img src={SaveSVG} alt="Save Icon" />
                </div>
            )}

            <div onClick={toggleMetronom}>
                {metronom ? (
                    <img src={MetronomSVG} alt="Metronom Icon" />
                ) : (
                    <img src={NoMetronomSVG} alt="Metronom Icon" />
                )}
            </div>
            <div onClick={toggleShowInfo}>
                <img src={RecSVG} alt="Recording Icon" />
            </div>
            {!isRecording && (
                <div
                    onClick={() => {
                        if (isPlaying) {
                            stopPlaying();
                        } else {
                            play();
                        }
                    }}
                >
                    {isPlaying ? (
                        <img src={StopSVG} alt="Play Icon" />
                    ) : (
                        <img src={PlaySVG} alt="Stop Icon" />
                    )}
                </div>
            )}
            {isRecording && (
                <div>
                    <img src={GreyPlaySVG} alt="Play Icon" />
                </div>
            )}
        </div>
    );
};

export default NavBar;
