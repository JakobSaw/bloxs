const RecordingLength = ({
    plus,
    trackLengthInBars,
    lengthOfNewRecording,
    changeLengthOfNewRecording,
    maxLengthOfRecording,
}) => {
    if (plus && trackLengthInBars) {
        if (
            lengthOfNewRecording < trackLengthInBars &&
            lengthOfNewRecording < maxLengthOfRecording
        ) {
            return <p onClick={() => changeLengthOfNewRecording(true)}>+</p>;
        } else {
            return <p className="grey">+</p>;
        }
    } else if (!plus && trackLengthInBars) {
        if (lengthOfNewRecording > 1) {
            return <p onClick={() => changeLengthOfNewRecording(false)}>-</p>;
        } else {
            return <p className="grey">-</p>;
        }
    } else {
        return null;
    }
};

export default RecordingLength;
