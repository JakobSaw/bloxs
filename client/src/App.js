import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useState } from "react";
import MainContext from "./context/MainContext";
import Infos from "./Components/Home";
import Project from "./Components/Project";
import NotFound from "./Components/NotFound";

const App = () => {
    const [mainState, setMainState] = useState({
        name: "",
        tempo: 120,
        trackLengthInBars: 8,
        timeSignature: 4,
        nextClipId: 0,
        audios: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ],
    });
    return (
        <MainContext.Provider value={{ mainState, setMainState }}>
            <Router>
                <Switch>
                    <Route path="/" exact component={Infos} />
                    <Route path="/project/:id" exact component={Project} />
                    <Route path="*" component={NotFound} />
                </Switch>
            </Router>
        </MainContext.Provider>
    );
};

export default App;
