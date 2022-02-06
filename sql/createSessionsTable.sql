DROP TABLE IF EXISTS session_infos;

CREATE TABLE session_infos (
    id SERIAL PRIMARY KEY,
    sessionId VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    tempo INTEGER NOT NULL,
    trackLengthInBars INTEGER NOT NULL,
    timeSignature INTEGER NOT NULL,
    nextClipId INTEGER NOT NULL,
    audios VARCHAR NOT NULL,
    mutedClips VARCHAR,
    soloedClips VARCHAR,
    passwordHash VARCHAR NOT NULL,
    created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);