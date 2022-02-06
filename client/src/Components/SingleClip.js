import DuplicateSVG from "../assets/Duplicate.svg";
import { useState } from "react";

const SingleClip = ({
    quarter,
    clip_id,
    durationInBars,
    timeSignature,
    quarterWidth,
    clipHeight,
    handleDoubleClick,
    moveClip,
    name,
    mouseMove,
}) => {
    const [dragging, setDragging] = useState(false);
    return (
        <div
            style={{
                width: `${durationInBars * timeSignature * quarterWidth}px`,
                left: `${quarterWidth * quarter}px`,
                top: `${clipHeight * clip_id + clip_id * 10}px`,
                height: `${clipHeight}px`,
            }}
            onMouseMove={(e) => {
                if (dragging) {
                    mouseMove(e);
                }
            }}
            onMouseDown={() => setDragging(true)}
            // onMouseUp={() => setDragging(false)}
            onDoubleClick={handleDoubleClick}
            className="single_clip"
        >
            <p>{name}</p>
            <div id={`clip_id_${quarter}_${clip_id}`}></div>
            <img
                src={DuplicateSVG}
                alt="Duplicate Icon"
                onClick={(e) => {
                    e.stopPropagation();
                    if (e.target.nodeName === "IMG") {
                        let selectContainer = e.target.parentNode;
                        let id = selectContainer.childNodes[1].id;
                        moveClip(id, selectContainer, "duplicate");
                    }
                }}
            />
        </div>
    );
};

export default SingleClip;
