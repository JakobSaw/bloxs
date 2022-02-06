const MuteSoloButtons = ({
    nextClipId,
    clipHeight,
    mutedClips,
    soloedClips,
    handleMute,
    handleSolo,
}) => {
    let returnContent = [];
    for (let i = 0; i < nextClipId; i++) {
        returnContent.push(
            <div
                id={`mute_solo_${i}`}
                key={i}
                style={{ height: `${clipHeight}px` }}
            >
                {mutedClips.indexOf(i) > -1 ? (
                    <button onClick={handleMute} className="active_mute">
                        M
                    </button>
                ) : (
                    <button onClick={handleMute} className="deactive_mute">
                        M
                    </button>
                )}
                {soloedClips.indexOf(i) > -1 ? (
                    <button onClick={handleSolo} className="active_solo">
                        S
                    </button>
                ) : (
                    <button onClick={handleSolo} className="deactive_solo">
                        S
                    </button>
                )}
            </div>
        );
    }
    return <div className="mute_solo_container">{returnContent}</div>;
};

export default MuteSoloButtons;
