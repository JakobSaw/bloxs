import ScaleUpDSVG from "../assets/Scale_Up_D.svg";
import ScaleDownDSVG from "../assets/Scale_Down_D.svg";
import ScaleLeftDSVG from "../assets/Scale_Left_D.svg";
import ScaleRightDSVG from "../assets/Scale_Right_D.svg";
import ScaleUpSVG from "../assets/Scale_Up.svg";
import ScaleDownSVG from "../assets/Scale_Down.svg";
import ScaleLeftSVG from "../assets/Scale_Left.svg";
import ScaleRightSVG from "../assets/Scale_Right.svg";
import BloxsSVG from "../assets/Logo.svg";

const GridResize = ({ isPlaying, isRecording, changeClipSize }) => {
    return (
        <>
            {!isPlaying && !isRecording && (
                <div key={"PlusMinus"} className="clip_height_container">
                    <button
                        onClick={() => changeClipSize("y_minus")}
                        className="active_solo"
                    >
                        <img src={ScaleUpSVG} />
                    </button>
                    <button
                        onClick={() => changeClipSize("y_plus")}
                        className="active_solo"
                    >
                        <img src={ScaleDownSVG} />
                    </button>
                    <button
                        onClick={() => changeClipSize("x_minus")}
                        className="active_solo"
                    >
                        <img src={ScaleLeftSVG} />
                    </button>
                    <button
                        onClick={() => changeClipSize("x_plus")}
                        className="active_solo"
                    >
                        <img src={ScaleRightSVG} />
                    </button>
                </div>
            )}
            {(isPlaying || isRecording) && (
                <div
                    key={"PlusMinus_Deactive"}
                    className="clip_height_container"
                >
                    <button className="active_solo">
                        <img src={ScaleUpDSVG} />
                    </button>
                    <button className="active_solo">
                        <img src={ScaleDownDSVG} />
                    </button>
                    <button className="active_solo">
                        <img src={ScaleLeftDSVG} />
                    </button>
                    <button className="active_solo">
                        <img src={ScaleRightDSVG} />
                    </button>
                </div>
            )}
            <div className="logo_container">
                <img src={BloxsSVG} className="logo" />
            </div>
        </>
    );
};

export default GridResize;
