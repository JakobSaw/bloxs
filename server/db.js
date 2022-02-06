const spicedPg = require("spiced-pg"),
    database = "loops",
    username = "postgres",
    password = "postgres",
    db = spicedPg(
        process.env.DATABASE_URL ||
            `postgres:${username}:${password}@localhost:5432/${database}` // PORT 5432 is reserved for SQL
    );

// Onboarding
module.exports.addSessionInfos = (
    sessionId,
    name,
    tempo,
    trackLengthInBars,
    timeSignature,
    nextClipId,
    audios,
    mutedClips = "",
    soloedClips = "",
    passwordHash
) => {
    const q = `INSERT INTO session_infos (sessionId, name, tempo, trackLengthInBars, timeSignature, nextClipId, audios, mutedClips, soloedClips, passwordHash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        params = [
            sessionId,
            name,
            tempo,
            trackLengthInBars,
            timeSignature,
            nextClipId,
            audios,
            mutedClips,
            soloedClips,
            passwordHash,
        ];
    return db.query(q, params);
};
module.exports.updateSessionInfos = (
    sessionId,
    nextClipId,
    audios,
    mutedClips,
    soloedClips
) => {
    const q = `UPDATE session_infos SET nextClipId = $2, audios = $3, mutedClips = $4, soloedClips = $5 WHERE sessionId = $1`,
        params = [sessionId, nextClipId, audios, mutedClips, soloedClips];
    return db.query(q, params);
};
module.exports.getHash = (sessionId) => {
    const q = `SELECT passwordHash FROM session_infos WHERE sessionId = $1;`,
        params = [sessionId];
    return db.query(q, params);
};
module.exports.getSession = (sessionId) => {
    const q = `SELECT * FROM session_infos WHERE sessionId = $1;`,
        params = [sessionId];
    return db.query(q, params);
};
