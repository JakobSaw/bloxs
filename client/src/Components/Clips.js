import { useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import SingleClip from "./SingleClip";

const Clips = ({
    quarterContent,
    clipHeight,
    quarterWidth,
    trackLengthInQuarters,
    nextClipId,
    changeProjectState,
    timeSignature,
}) => {
    // Click Event on Clip
    const wavesurferColor = "#787f8a";
    let timer = 0;
    function handleDoubleClick(e) {
        clearTimeout(timer);
        doDoubleClickAction(e);
    }
    function doDoubleClickAction(e) {
        // Delete the Clip
        let selectContainer;
        let id;
        if (e.target.nodeName === "P") {
            selectContainer = e.target.parentNode;
            id = selectContainer.childNodes[1].id;
        } else if (e.target.nodeName === "WAVE") {
            selectContainer = e.target.parentNode;
            id = e.target.parentNode.id;
        } else {
            selectContainer = e.target;
            id = selectContainer.childNodes[1].id;
        }
        moveClip(id, selectContainer, "delete");
    }
    // Mouse Movement
    let lastXPoint = null;
    const moveClip = (full_id, selectContainer, action) => {
        // action = "right | left | duplicate | delete"
        const onlyTheId = full_id.substring(8, full_id.length);
        const infos = onlyTheId.split("_");
        const quarter = +infos[0] + 1;
        const clip_id = +infos[1];
        let currentClip;
        const newOldQuarter = quarterContent[quarter - 1].filter((current) => {
            if (current.clip_id !== clip_id) {
                return current;
            } else {
                currentClip = current;
            }
        });
        let newQuarterPosition;
        let clipLengthInQuarters = currentClip.durationInBars * timeSignature;
        let endOfClipOnNewPosition = newQuarterPosition + clipLengthInQuarters;
        if (action === "left") {
            newQuarterPosition = quarter - 1;
        } else if (action === "right") {
            newQuarterPosition = quarter + 1;
        } else if (action === "duplicate") {
            newQuarterPosition = quarter + clipLengthInQuarters;
        }
        // Check 1
        if (action === "left" && newQuarterPosition < 1) {
            console.log("Clip can not move to the Left");
            return;
        } else if (
            (action === "right" &&
                endOfClipOnNewPosition > trackLengthInQuarters + 1) ||
            (action === "duplicate" &&
                endOfClipOnNewPosition > trackLengthInQuarters + 1)
        ) {
            console.log("There is a Clip to the Right or be Duplicated");
            return;
        } else if (action === "delete") {
            let lastClipWithThisClipId = [];
            const newNextClipId = nextClipId - 1;
            let newQuarterContent = [...quarterContent];
            newQuarterContent.splice(quarter - 1, 1);
            newQuarterContent.splice(quarter - 1, 0, newOldQuarter);
            quarterContent.forEach((current) => {
                if (current.length > 0) {
                    current.forEach((current) => {
                        if (current.clip_id === clip_id) {
                            lastClipWithThisClipId.push(current);
                        }
                    });
                }
            });
            if (lastClipWithThisClipId.length > 1) {
                changeProjectState({
                    quarterContent: [...newQuarterContent],
                });
            } else {
                newQuarterContent.forEach((current) => {
                    if (current.length > 0) {
                        current.forEach((current) => {
                            if (current.clip_id > clip_id) {
                                current.clip_id -= 1;
                            }
                        });
                    }
                });
                changeProjectState({
                    nextClipId: newNextClipId,
                    quarterContent: [...newQuarterContent],
                });
            }
        } else {
            // Checks 2
            let checkForNeighborClip = quarterContent[
                newQuarterPosition - 1
            ].filter((current) => {
                if (current.clip_id === clip_id) {
                    return current;
                }
            });
            if (checkForNeighborClip.length > 0) {
                console.log("There is a Neighbor Clip");
                return;
            } else {
                let newQuarterContent = [...quarterContent];
                let newQuarterAtNewPosition =
                    quarterContent[newQuarterPosition - 1];
                newQuarterAtNewPosition.push(currentClip);
                if (action === "duplicate") {
                    newQuarterContent.splice(newQuarterPosition - 1, 1);
                    newQuarterContent.splice(
                        newQuarterPosition - 1,
                        0,
                        newQuarterAtNewPosition
                    );
                    console.log("Clip Duplicated");
                    changeProjectState({
                        quarterContent: [...newQuarterContent],
                    });
                } else {
                    newQuarterContent.splice(quarter - 1, 1);
                    newQuarterContent.splice(quarter - 1, 0, newOldQuarter);
                    selectContainer.setAttribute(
                        "id",
                        `clip_id_${newQuarterPosition - 1}_${clip_id}`
                    );
                    // lastXPoint = null;
                    changeProjectState({
                        quarterContent: [...newQuarterContent],
                    });
                }
            }
        }
    };
    const mouseMove = (e) => {
        console.log("MouseMove");
        let selectContainer;
        let id;
        let snap = quarterWidth / 4;
        if (e.target.nodeName === "WAVE") {
            selectContainer = e.target.parentNode;
            id = e.target.parentNode.id;
            if (lastXPoint == null) {
                lastXPoint = e.clientX;
            } else {
                if (e.clientX > lastXPoint) {
                    if (e.clientX - lastXPoint > snap) {
                        moveClip(id, selectContainer, "right");
                    }
                } else if (e.clientX < lastXPoint) {
                    if (e.clientX - lastXPoint < snap) {
                        moveClip(id, selectContainer, "left");
                    }
                }
            }
        } else if (e.target.classList.contains("single_clip")) {
            selectContainer = e.target;
            id = e.target.childNodes[1].id;
            if (lastXPoint == null) {
                lastXPoint = e.clientX;
            } else {
                if (e.clientX > lastXPoint) {
                    moveClip(id, selectContainer, "right");
                    /* if (e.clientX - lastXPoint > snap) {
                    } */
                } else if (e.clientX < lastXPoint) {
                    moveClip(id, selectContainer, "left");
                    /* if (e.clientX - lastXPoint < snap) {
                    } */
                }
            }
        }
    };
    let returnContent = [];
    useEffect(() => {
        if (returnContent.length > 0) {
            quarterContent.forEach((current, quarter) => {
                if (current.length > 0) {
                    current.forEach((current) => {
                        if (current.sampleID) {
                            // Dont use Wavesurfer
                        } else {
                            var wavesurfer = WaveSurfer.create({
                                container: `#clip_id_${quarter}_${current.clip_id}`,
                                waveColor: wavesurferColor,
                                progressColor: wavesurferColor,
                            });
                            if (current.content) {
                                wavesurfer.load(current.content);
                            }
                        }
                    });
                }
            });
        }
    }, [quarterContent]);
    quarterContent.forEach((current, quarter) => {
        if (current.length > 0) {
            current.forEach(async (current) => {
                returnContent.push(
                    <SingleClip
                        key={`clip_id_${quarter}_${current.clip_id}`}
                        quarter={quarter}
                        clip_id={current.clip_id}
                        durationInBars={current.durationInBars}
                        timeSignature={timeSignature}
                        quarterWidth={quarterWidth}
                        clipHeight={clipHeight}
                        handleDoubleClick={handleDoubleClick}
                        moveClip={moveClip}
                        name={current.name}
                        mouseMove={mouseMove}
                    />
                );
            });
        }
    });
    return returnContent;
};

export default Clips;
