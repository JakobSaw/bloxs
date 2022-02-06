const fixedBarsIndicator = ({ trackLengthInBars, timeSignature }) => {
    if (trackLengthInBars) {
        let bars = [];
        for (let i = 0; i < trackLengthInBars; i++) {
            let spanCount = [];
            for (let j = 0; j < timeSignature + 1; j++) {
                spanCount.push(<span key={`count_${j}`}></span>);
            }
            bars.push(
                <div key={i} id={`bar_${i + 1}`}>
                    <p>{i + 1}</p>
                    {spanCount}
                </div>
            );
        }
        return bars;
    } else {
        return null;
    }
};

export default fixedBarsIndicator;
