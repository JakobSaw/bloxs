import { useContext, useState, useEffect } from "react";
import MainContext from "../context/MainContext";
import { useHistory } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import FullLogoSVG from "../assets/FullLogo.svg";
import TrashSVG from "../assets/Trash.svg";

const Home = () => {
    const { mainState, setMainState } = useContext(MainContext);
    const [formState, setFormState] = useState({
        disableTempoMinus: false,
        disableTempoPlus: false,
        disableLengthMinus: false,
        disableLengthPlus: false,
        disableTSMinus: false,
        disableTSPlus: false,
        enterid: "",
        enterpw: "",
    });
    const [localystoredSessions, setLocalyStoredSessions] = useState([]);
    const availableTrackLengths = [4, 8, 16, 32, 64];
    const history = useHistory();
    const tempoStep = 5;

    // Handle Form Changes
    const handleNameChange = (e) => {
        setMainState({
            ...mainState,
            name: e.target.value,
        });
    };
    const handleBarChange = (plus) => {
        const currentIndex = availableTrackLengths.indexOf(
            mainState.trackLengthInBars
        );
        if (plus && currentIndex === 3) {
            setFormState({
                ...formState,
                disableLengthPlus: true,
            });
            setMainState({
                ...mainState,
                trackLengthInBars: availableTrackLengths[4],
            });
        } else if (plus) {
            setFormState({
                ...formState,
                disableLengthMinus: false,
            });
            setMainState({
                ...mainState,
                trackLengthInBars: availableTrackLengths[currentIndex + 1],
            });
        } else if (currentIndex === 1) {
            setFormState({
                ...formState,
                disableLengthMinus: true,
            });
            setMainState({
                ...mainState,
                trackLengthInBars: availableTrackLengths[0],
            });
        } else {
            setFormState({
                ...formState,
                disableLengthPlus: false,
            });
            setMainState({
                ...mainState,
                trackLengthInBars: availableTrackLengths[currentIndex - 1],
            });
        }
    };
    const handleTempoChange = (plus) => {
        if (plus && mainState.tempo < 245) {
            setMainState({
                ...mainState,
                tempo: mainState.tempo + tempoStep,
            });
            setFormState({
                ...formState,
                disableTempoMinus: false,
            });
        } else if (plus) {
            setFormState({
                ...formState,
                disableTempoPlus: true,
                disableTempoMinus: false,
            });
            setMainState({
                ...mainState,
                tempo: mainState.tempo + tempoStep,
            });
        } else if (mainState.tempo > 45) {
            setMainState({
                ...mainState,
                tempo: mainState.tempo - tempoStep,
            });
            setFormState({
                ...formState,
                disableTempoPlus: false,
            });
        } else {
            setFormState({
                ...formState,
                disableTempoMinus: true,
                disableTempoPlus: false,
            });
            setMainState({
                ...mainState,
                tempo: mainState.tempo - tempoStep,
            });
        }
    };
    const handleTimeSignatureChange = (plus) => {
        if (plus && mainState.timeSignature === 3) {
            setMainState({
                ...mainState,
                timeSignature: 4,
            });
            setFormState({
                ...formState,
                disableTSMinus: false,
            });
        } else if (plus) {
            setFormState({
                ...formState,
                disableTSPlus: true,
                disableTSMinus: false,
            });
            setMainState({
                ...mainState,
                timeSignature: 5,
            });
        } else if (!plus && mainState.timeSignature === 5) {
            setMainState({
                ...mainState,
                timeSignature: 4,
            });
            setFormState({
                ...formState,
                disableTSPlus: false,
            });
        } else {
            setFormState({
                ...formState,
                disableTSMinus: true,
                disableTSPlus: false,
            });
            setMainState({
                ...mainState,
                timeSignature: 3,
            });
        }
    };

    // Enter a Session
    const handleEnter = (e) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value,
        });
    };
    const enterSession = async () => {
        console.log(formState.enterid, formState.enterpw);
        const resp = await fetch("/session/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: formState.enterid,
                password: formState.enterpw,
            }),
        });
        const data = await resp.json();
        if (data.sessionid) {
            let sessionStorage = [];
            let storedSessions = localStorage.getItem("__cloud_sessions__");
            if (storedSessions) {
                sessionStorage = JSON.parse(storedSessions);
            }
            sessionStorage.push({
                name: data.name,
                sessionId: data.sessionid,
            });
            const stringifiedSessionStorage = JSON.stringify(sessionStorage);
            localStorage.setItem(
                "__cloud_sessions__",
                stringifiedSessionStorage
            );
            const enterId = formState.enterid;
            setFormState({
                ...formState,
                enterid: "",
                enterpw: "",
            });
            window.location.href = `/project/${enterId}`;
        } else {
            alert("Wrong Password");
        }
    };

    // Delete Session
    const deleteSession = (e, id) => {
        e.stopPropagation();
        console.log(id);
        if (id.startsWith("local_")) {
            let sessionStorage = [];
            let storedSessions = localStorage.getItem("__local_sessions__");
            sessionStorage = JSON.parse(storedSessions);
            let sessionStorageWithoutCurrentSession = sessionStorage.filter(
                (current) => {
                    if (current.sessionId !== id) {
                        return current;
                    }
                }
            );
            const stringifiedSessionStorage = JSON.stringify(
                sessionStorageWithoutCurrentSession
            );
            localStorage.setItem(
                "__local_sessions__",
                stringifiedSessionStorage
            );
            updateSessionsOverview();
        } else {
            let sessionStorage = [];
            let storedSessions = localStorage.getItem("__cloud_sessions__");
            sessionStorage = JSON.parse(storedSessions);
            let sessionStorageWithoutCurrentSession = sessionStorage.filter(
                (current) => {
                    if (current.sessionId !== id) {
                        return current;
                    }
                }
            );
            const stringifiedSessionStorage = JSON.stringify(
                sessionStorageWithoutCurrentSession
            );
            localStorage.setItem(
                "__cloud_sessions__",
                stringifiedSessionStorage
            );
            updateSessionsOverview();
        }
    };

    // Handle Sessions
    const createSession = () => {
        // 1. Create QuarterContent
        let createQuarterContent = [];
        for (
            let i = 0;
            i < mainState.trackLengthInBars * mainState.timeSignature;
            i++
        ) {
            createQuarterContent.push(new Array());
        }
        let sessionStorage = [];
        let storedSessions = localStorage.getItem("__local_sessions__");
        let newSession;
        if (!storedSessions) {
            newSession = {
                ...mainState,
                sessionId: `local_${1}`,
                audios: [...createQuarterContent],
                mutedClips: [],
                soloedClips: [],
            };
            sessionStorage.push(newSession);
            const stringifiedSessionStorage = JSON.stringify(sessionStorage);
            localStorage.setItem(
                "__local_sessions__",
                stringifiedSessionStorage
            );
        } else {
            sessionStorage = JSON.parse(storedSessions);
            newSession = {
                ...mainState,
                sessionId: `local_${sessionStorage.length + 1}`,
                audios: [...createQuarterContent],
                mutedClips: [],
                soloedClips: [],
            };
            sessionStorage.push(newSession);
            const stringifiedSessionStorage = JSON.stringify(sessionStorage);
            localStorage.setItem(
                "__local_sessions__",
                stringifiedSessionStorage
            );
        }
        // Open Project
        setMainState(newSession);
        history.push(`/project/local_${sessionStorage.length}`);
    };
    const updateSessionsOverview = () => {
        const storedLocalSessions = localStorage.getItem("__local_sessions__");
        const storedCloudSessions = localStorage.getItem("__cloud_sessions__");
        const parsedLocalSessions = JSON.parse(storedLocalSessions);
        const parsedCloudSessions = JSON.parse(storedCloudSessions);
        if (parsedLocalSessions || parsedCloudSessions) {
            console.log(parsedLocalSessions, parsedCloudSessions);
            setLocalyStoredSessions([
                ...(parsedLocalSessions || []),
                ...(parsedCloudSessions || []),
            ]);
        }
    };
    useEffect(() => {
        updateSessionsOverview();
    }, []);

    //
    return (
        <div className="home">
            <header>
                <HashLink to="/#create">
                    <img src={FullLogoSVG} />
                </HashLink>
                <div className="menu">
                    <HashLink to="/#create">
                        <p>Create</p>
                    </HashLink>
                    {localystoredSessions.length > 0 && (
                        <HashLink to="/#you">
                            <p>Your Sessions</p>
                        </HashLink>
                    )}
                    <HashLink to="/#code">
                        <p>Enter a Session</p>
                    </HashLink>
                    {/* <HashLink to="/#instructions">
                        <p>Instructions</p>
                    </HashLink> */}
                    {/* <HashLink to="/#about">
                        <p>About</p>
                    </HashLink> */}
                </div>
            </header>
            <section id="create">
                <div>
                    <h1>
                        creating music.
                        <br />
                        <span>together.</span>
                    </h1>
                    <p>
                        <span>Bloxs</span> is a DAW for the Browser...
                        <br />
                        <br />A collaborative Tool for recording and creating
                        music via Sessions that can be shared with anybody.
                        Create a Session or enter a Session and work together on
                        musical ideas, see what your collborators do and record
                        on their ideas. Make your music, truly connected.
                    </p>
                </div>
                <div>
                    <div>
                        <input
                            name="name"
                            placeholder="Give your Session a Name..."
                            onChange={handleNameChange}
                        />
                        <p>Set a Tempo</p>
                        {mainState.tempo && (
                            <div>
                                <button
                                    onClick={() => handleTempoChange(false)}
                                    disabled={formState.disableTempoMinus}
                                >
                                    -
                                </button>
                                <p id="bars">{mainState.tempo}</p>
                                <button
                                    onClick={() => handleTempoChange(true)}
                                    disabled={formState.disableTempoPlus}
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <p>Set the Length</p>
                        {mainState.trackLengthInBars && (
                            <div>
                                <button
                                    onClick={() => handleBarChange(false)}
                                    disabled={formState.disableLengthMinus}
                                >
                                    -
                                </button>
                                <p id="bars">
                                    {mainState.trackLengthInBars} Bars
                                </p>
                                <button
                                    onClick={() => handleBarChange(true)}
                                    disabled={formState.disableLengthPlus}
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <p>Set the Time Signature</p>
                        {mainState.timeSignature && (
                            <div>
                                <button
                                    onClick={() =>
                                        handleTimeSignatureChange(false)
                                    }
                                    disabled={formState.disableTSMinus}
                                >
                                    +
                                </button>
                                <p id="time_signature">
                                    {mainState.timeSignature} / 4
                                </p>
                                <button
                                    onClick={() =>
                                        handleTimeSignatureChange(true)
                                    }
                                    disabled={formState.disableTSPlus}
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <button
                            onClick={createSession}
                            disabled={mainState.name === ""}
                        >
                            Create Session
                        </button>
                    </div>
                </div>
            </section>
            {localystoredSessions.length > 0 && (
                <section id="you">
                    <h1>
                        your <span>sessions</span>
                    </h1>
                    <div>
                        {localystoredSessions.map((current) => {
                            return (
                                <div
                                    key={current.sessionId}
                                    onClick={() => {
                                        if (
                                            typeof current.sessionId ===
                                                "string" &&
                                            current.sessionId.startsWith(
                                                "local_"
                                            )
                                        ) {
                                            history.push(
                                                `/project/${current.sessionId}`
                                            );
                                        } else {
                                            history.push(
                                                `/project/${current.sessionId}`
                                            );
                                        }
                                    }}
                                >
                                    <p>{current.name}</p>
                                    <img
                                        src={TrashSVG}
                                        onClick={(e) =>
                                            deleteSession(e, current.sessionId)
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
            <section id="code">
                <h1>
                    enter a <span>session</span>
                </h1>
                <div>
                    <input
                        name="enterid"
                        placeholder="Session ID"
                        onChange={handleEnter}
                    />
                    <input
                        name="enterpw"
                        placeholder="Session Password"
                        type="password"
                        onChange={handleEnter}
                    />
                    <button
                        onClick={enterSession}
                        disabled={
                            formState.enterid === "" || formState.enterpw === ""
                        }
                    >
                        Enter Session
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
