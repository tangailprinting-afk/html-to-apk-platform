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

</div>
`;

const generateBtn =
    document.getElementById("generateBtn");

const status =
    document.getElementById("status");

generateBtn.addEventListener(
    "click",
    async () => {

        try {

            status.innerHTML =
                "Starting Cloud Build...";

            const token =
                import.meta.env.VITE_GITHUB_TOKEN;

            const owner =
                import.meta.env.VITE_GITHUB_OWNER;

            const repo =
                import.meta.env.VITE_GITHUB_REPO;

            const appName =
                document.getElementById(
                    "appName"
                ).value;

            const packageName =
                document.getElementById(
                    "packageName"
                ).value;

            const response =
                await fetch(
`https://api.github.com/repos/${owner}/${repo}/actions/workflows/android.yml/dispatches`,
                {
                    method:"POST",

                    headers:{
                        Accept:
"application/vnd.github+json",

                        Authorization:
`Bearer ${token}`,

                        "Content-Type":
"application/json"
                    },

                    body:JSON.stringify({

                        ref:"main",

                        inputs:{
                            app_name:appName,
                            package_name:packageName
                        }

                    })

                }
            );

            if(response.status === 204){

                status.innerHTML =
                    "GitHub APK Build Started 🚀";

            } else {

                status.innerHTML =
                    "Build Failed";

            }

        } catch(error){

            console.log(error);

            status.innerHTML =
                "Server Error";

        }

    }
);