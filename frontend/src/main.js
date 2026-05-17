import "./app.css";

document.querySelector("#app").innerHTML = `
<div class="container">

    <h1>HTML To APK Platform</h1>

    <input
        id="appName"
        type="text"
        placeholder="App Name"
    />

    <input
        id="packageName"
        type="text"
        placeholder="Package Name"
    />

    <textarea
        id="htmlCode"
        placeholder="Paste HTML Code"
    ></textarea>

    <label>Upload ZIP Project</label>

    <input
        id="zipFile"
        type="file"
    />

    <label>Upload App Icon</label>

    <input
        id="appIcon"
        type="file"
    />

    <button id="generateBtn">
        Generate APK
    </button>

    <div id="status"></div>

    <a
        id="downloadBtn"
        style="display:none"
        target="_blank"
    >
        Download APK
    </a>

</div>
`;

const generateBtn =
    document.getElementById("generateBtn");

const status =
    document.getElementById("status");

const downloadBtn =
    document.getElementById("downloadBtn");

generateBtn.addEventListener(
    "click",
    async () => {

        try {

            status.innerHTML =
                "Generating APK...";

            downloadBtn.style.display =
                "none";

            const appName =
                document.getElementById(
                    "appName"
                ).value;

            const packageName =
                document.getElementById(
                    "packageName"
                ).value;

            const htmlCode =
                document.getElementById(
                    "htmlCode"
                ).value;

            const zipFile =
                document.getElementById(
                    "zipFile"
                ).files[0];

            const appIcon =
                document.getElementById(
                    "appIcon"
                ).files[0];

            const formData =
                new FormData();

            formData.append(
                "appName",
                appName
            );

            formData.append(
                "packageName",
                packageName
            );

            formData.append(
                "htmlCode",
                htmlCode
            );

            if(zipFile){

                formData.append(
                    "zipFile",
                    zipFile
                );

            }

            if(appIcon){

                formData.append(
                    "appIcon",
                    appIcon
                );

            }

            const response =
                await fetch(
                    "https://html-to-apk-platform.onrender.com/generate",
                    {
                        method:"POST",
                        body:formData
                    }
                );

            const data =
                await response.json();

            console.log(data);

            if(data.success){

                status.innerHTML =
                    "APK Build Successful";

                if(data.apkUrl){

                    downloadBtn.href =
                        data.apkUrl;

                    downloadBtn.style.display =
                        "inline-block";

                    downloadBtn.innerHTML =
                        "Download APK";

                }

            } else {

                status.innerHTML =
                    data.error || "Build Failed";

            }

        } catch(error){

            console.log(error);

            status.innerHTML =
                "Server Error";

        }

    }
);