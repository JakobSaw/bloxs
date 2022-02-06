const Bars = ({ trackLengthInBars }) => {
    if (trackLengthInBars) {
        let bars = [];
        for (let i = 0; i < trackLengthInBars; i++) {
            bars.push(<div key={i}></div>);
        }
        return bars;
    } else {
        return null;
    }
};

export default Bars;
