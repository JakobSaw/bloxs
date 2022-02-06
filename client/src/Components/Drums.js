import KickSVG from "../assets/DrumSounds/Icons/Kick.svg";
import SnareSVG from "../assets/DrumSounds/Icons/Snare.svg";
import CHHSVG from "../assets/DrumSounds/Icons/CHH.svg";
import HCSVG from "../assets/DrumSounds/Icons/Handclap.svg";
import OHHSVG from "../assets/DrumSounds/Icons/OpenHH.svg";
import RimshotSVG from "../assets/DrumSounds/Icons/Rimshot.svg";

const Drums = ({ recordDrums, handleDrumHit, changeProjectState }) => {
    return (
        <div className="drums_container">
            <div className="toggle_drum_recording">
                <div
                    className={`toggle ${recordDrums ? "right" : "left"}`}
                    onClick={() =>
                        changeProjectState({
                            recordDrums: !recordDrums,
                        })
                    }
                >
                    <div></div>
                </div>
            </div>
            <div className="drum_grid">
                <div onClick={() => handleDrumHit("Kick")}>
                    <img src={KickSVG} />
                </div>
                <div onClick={() => handleDrumHit("Snare")}>
                    <img src={SnareSVG} />
                </div>
                <div onClick={() => handleDrumHit("CHH")}>
                    <img src={CHHSVG} />
                </div>
                <div onClick={() => handleDrumHit("HC")}>
                    <img src={HCSVG} />
                </div>
                <div onClick={() => handleDrumHit("OHH")}>
                    <img src={OHHSVG} />
                </div>
                <div onClick={() => handleDrumHit("RIM")}>
                    <img src={RimshotSVG} />
                </div>
            </div>
        </div>
    );
};

export default Drums;
