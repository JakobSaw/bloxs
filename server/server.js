const express = require("express"),
    app = express(),
    compression = require("compression"),
    path = require("path"),
    cookieSession = require("cookie-session"),
    { hash, compare } = require("./bc"),
    crypto = require("crypto"),
    {
        addSessionInfos,
        getHash,
        getSession,
        updateSessionInfos,
    } = require("./db"),
    multer = require("multer"),
    uidSafe = require("uid-safe"),
    diskStorage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, path.join(__dirname, "uploads"));
        },
        filename: function (req, file, callback) {
            uidSafe(24).then(function (uid) {
                callback(null, uid + path.extname(file.originalname));
            });
        },
    }),
    uploader = multer({
        storage: diskStorage,
        limits: {
            fileSize: 2097152,
        },
    }),
    aws = require("aws-sdk"),
    fs = require("fs");
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "public")));
// Cookie Session
let sessionSecret;
if (process.env.NODE_ENV == "production") {
    sessionSecret = process.env.SESSION_SECRET;
} else {
    sessionSecret = require("./secrets.json").SESSION_SECRET;
}
app.use(
    cookieSession({
        secret: sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.use(express.urlencoded({ extended: false }));
// Deny X-Frame-Options
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
// HTTPS Redirect
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// Verification
app.post("/session/verify", async (req, res) => {
    const { id, password } = req.body;
    try {
        const getPasswordHash = await getHash(id);
        if (getPasswordHash.rows.length) {
            const compared = await compare(
                password,
                getPasswordHash.rows[0].passwordhash
            );
            if (compared) {
                const sessionInfos = await getSession(id);
                return res.json(sessionInfos.rows[0]);
            }
            return res.json(compared);
        } else {
            return res.json({ notfound: true });
        }
    } catch (err) {
        return res.json({ error: err });
    }
});

// Load Session
app.post("/session/load", async (req, res) => {
    const { id } = req.body;
    try {
        if (id) {
            const sessionInfos = await getSession(id);
            if (sessionInfos.rows.length) {
                return res.json(sessionInfos.rows[0]);
            } else {
                return res.json({ notfound: true });
            }
        } else {
            return res.json({ notfound: true });
        }
    } catch (err) {
        return res.json({ error: err });
    }
});

// Update Session
app.post("/session/update", async (req, res) => {
    const { id, nextClipId, audios, mutedClips, soloedClips } = req.body;
    try {
        await updateSessionInfos(
            id,
            nextClipId,
            audios,
            mutedClips,
            soloedClips
        );
        return res.json({ success: true });
    } catch (err) {
        return res.json({ error: err });
    }
});

// Create New Session
app.post("/session/upload", async (req, res) => {
    const {
        name,
        tempo,
        trackLengthInBars,
        timeSignature,
        nextClipId,
        audios,
        mutedClips,
        soloedClips,
        password,
    } = req.body;
    try {
        // Hash Password
        const hashedPassord = await hash(password);
        const id = crypto.randomBytes(8).toString("hex");
        await addSessionInfos(
            id,
            name,
            tempo,
            trackLengthInBars,
            timeSignature,
            nextClipId,
            audios,
            mutedClips,
            soloedClips,
            hashedPassord.hash
        );
        return res.json(id);
    } catch (err) {
        return res.json({ error: err });
    }
});
app.post("/upload", uploader.single("file"), async (req, res) => {
    let secrets;
    if (process.env.NODE_ENV == "production") {
        secrets = process.env;
    } else {
        secrets = require("./secrets");
    }

    const s3 = new aws.S3({
        accessKeyId: secrets.AWS_KEY || process.env.AWS_KEY,
        secretAccessKey: secrets.AWS_SECRET || process.env.AWS_SECRET,
    });

    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            res.json(`https://s3.amazonaws.com/spicedling/${filename}`);
        })
        .catch((err) => {
            // uh oh
            console.log(err);
        });
});

// Application
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});
app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
