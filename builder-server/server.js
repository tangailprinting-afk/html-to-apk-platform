const { exec } = require("child_process");
const AdmZip = require("adm-zip");
const fs = require("fs-extra");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/downloads",
    express.static(
        path.join(
            __dirname,
            "..",
            "android-template",
            "WebAppEngine",
            "app",
            "build",
            "outputs",
            "apk",
            "debug"
        )
    )
);




const upload = multer({
    dest: "uploads/"
});

app.get("/", (req, res) => {
    res.send("APK Builder Server Running 🚀");
});

app.post(
    "/generate",
    upload.fields([
        { name: "zipFile" },
        { name: "appIcon" }
    ]),
    async (req, res) => {

        try {

            console.log("BODY:", req.body);

            console.log("FILES:", req.files);

            const projectPath = path.join(
                __dirname,
                "temp",
                Date.now().toString()
            );

            await fs.ensureDir(projectPath);

            // =========================
            // HTML CREATE
            // =========================

            const htmlCode = req.body.htmlCode || "";

            if(htmlCode){

                const htmlPath = path.join(
                    projectPath,
                    "index.html"
                );

                await fs.writeFile(
                    htmlPath,
                    htmlCode
                );

                console.log("HTML FILE CREATED");

            }

            // =========================
            // ZIP EXTRACT
            // =========================

            if(req.files && req.files.zipFile){

                const zipFile = req.files.zipFile[0];

                const zip = new AdmZip(zipFile.path);

                zip.extractAllTo(projectPath, true);

                console.log("ZIP Extracted");

                const extractedFiles =
                    await fs.readdir(projectPath);

                console.log(
                    "EXTRACTED FILES:",
                    extractedFiles
                );

            }

            console.log("PROJECT PATH:", projectPath);

            // =========================
            // COPY TO TEMPLATE
            // =========================

            const assetsPath = path.join(
                __dirname,
                "..",
                "android-template",
                "WebAppEngine",
                "app",
                "src",
                "main",
                "assets",
                "www"
            );

            await fs.emptyDir(assetsPath);

            await fs.copy(projectPath, assetsPath);

            console.log("FILES COPIED TO TEMPLATE");

            // =========================
            // APP NAME UPDATE
            // =========================

            const appName =
                req.body.appName || "My App";

            const stringsPath = path.join(
                __dirname,
                "..",
                "android-template",
                "WebAppEngine",
                "app",
                "src",
                "main",
                "res",
                "values",
                "strings.xml"
            );

            const stringsContent = `
<resources>
    <string name="app_name">${appName}</string>
</resources>
`;

            await fs.writeFile(
                stringsPath,
                stringsContent
            );

            console.log("APP NAME UPDATED");

            // =========================
            // PACKAGE NAME UPDATE
            // =========================

            const packageName =
                req.body.packageName ||
                "com.webapp.engine";

            const gradlePath = path.join(
                __dirname,
                "..",
                "android-template",
                "WebAppEngine",
                "app",
                "build.gradle.kts"
            );

            let gradleContent =
                await fs.readFile(
                    gradlePath,
                    "utf8"
                );

            gradleContent =
                gradleContent.replace(
                    /namespace = ".*?"/,
                    `namespace = "${packageName}"`
                );

            gradleContent =
                gradleContent.replace(
                    /applicationId = ".*?"/,
                    `applicationId = "${packageName}"`
                );

            await fs.writeFile(
                gradlePath,
                gradleContent
            );

            console.log("PACKAGE NAME UPDATED");

            // =========================
            // APP ICON UPDATE
            // =========================

            if(req.files && req.files.appIcon){

                const iconFile =
                    req.files.appIcon[0];

                const mipmapFolders = [
                    "mipmap-hdpi",
                    "mipmap-mdpi",
                    "mipmap-xhdpi",
                    "mipmap-xxhdpi",
                    "mipmap-xxxhdpi"
                ];

                for(const folder of mipmapFolders){

                    const iconPath = path.join(
                        __dirname,
                        "..",
                        "android-template",
                        "WebAppEngine",
                        "app",
                        "src",
                        "main",
                        "res",
                        folder,
                        "ic_launcher.png"
                    );

                    await fs.copyFile(
                        iconFile.path,
                        iconPath
                    );

                    const roundIconPath =
                        path.join(
                            __dirname,
                            "..",
                            "android-template",
                            "WebAppEngine",
                            "app",
                            "src",
                            "main",
                            "res",
                            folder,
                            "ic_launcher_round.png"
                        );

                    if(await fs.pathExists(roundIconPath)){

                        await fs.copyFile(
                            iconFile.path,
                            roundIconPath
                        );

                    }

                }

                console.log("APP ICON UPDATED");

            }

            // =========================
            // APK BUILD
            // =========================

            const templatePath = path.join(
                __dirname,
                "..",
                "android-template",
                "WebAppEngine"
            );

            exec(
                "gradlew.bat assembleDebug",
                {
                    cwd: templatePath
                },
                (error, stdout, stderr) => {

                    if(error){

                        console.log(stderr);

                        return res.status(500).json({
                            success:false,
                            error:stderr
                        });

                    }

                    console.log(stdout);

                res.json({
    success:true,
    message:"APK Build Successful",
    apkUrl:
    "http://localhost:3000/downloads/app-debug.apk"
});

                }
            );

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});