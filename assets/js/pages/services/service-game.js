var editor = ace.edit("editor");
editor.setTheme("ace/theme/nord_dark");
editor.session.setMode("ace/mode/yaml");

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

var term = new Terminal({
  convertEol: true,
  theme: {
    background: "#222738",
  },
  cursorBlink: true,
});

var back = [];
var files_data = {};

function load_files(directory) {
  document.getElementById("files-explorer").innerHTML =
    '<a class="list-group-item list-group-item"><div class="spinner-grow text-secondary" role="status"></div></a>';
  fetch(`https://dash.mercurycloud.fr:8000/api/services/${url.searchParams.get("id")}/files?uuid=${getCookie("uuid")}&token=${getCookie("token")}&directory=${directory}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (json_files) {
      if (json_files.error === false) {
        files_data = json_files.data;
        if (!back.includes(directory)) {
          back.push(directory);
        }
        if (directory == "/") {
          document.getElementById("back-button").classList.add("disabled");
        } else {
          document.getElementById("back-button").classList.remove("disabled");
        }
        var nav = directory.split("/");
        var nav_html = "";
        for (let i = 0; i < nav.length; i++) {
          if (nav[i].length > 0) {
            nav_html += `<li class="breadcrumb-item"><a>${nav[i]}</a></li>`;
          }
        }
        file_title = nav.slice(-1);
        if (nav.slice(-1) == "") {
          file_title = "/";
          document.getElementById("file-title").innerHTML = file_title;
          document.getElementById("file-name").classList.add("disabled");
          document.getElementById("save-file-btn").classList.add("disabled");
        } else {
          document.getElementById("file-name").classList.remove("disabled");
          document.getElementById("save-file-btn").classList.remove("disabled");
          document.getElementById("file-title").innerHTML = file_title;
        }
        document.getElementById("file-name").value = file_title;
        document.getElementById("files-explorer-nav").innerHTML = nav_html;
        document.getElementById("files-explorer").innerHTML = "";
        for (let i = 0; i < json_files.data.length; i++) {
          if (json_files.data[i].attributes.name == "outof300fileslimit") {
            document.getElementById("files-explorer").innerHTML += `                              
                                        <div class="list-group-item list-group-item-action not-selectable">
                                            <svg width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.4" d="M16.8843 5.11485H13.9413C13.2081 5.11969 12.512 4.79355 12.0474 4.22751L11.0782 2.88762C10.6214 2.31661 9.9253 1.98894 9.19321 2.00028H7.11261C3.37819 2.00028 2.00001 4.19201 2.00001 7.91884V11.9474C1.99536 12.3904 21.9956 12.3898 21.9969 11.9474V10.7761C22.0147 7.04924 20.6721 5.11485 16.8843 5.11485Z"
                                                    fill="currentColor"></path>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8321 6.54353C21.1521 6.91761 21.3993 7.34793 21.5612 7.81243C21.8798 8.76711 22.0273 9.77037 21.9969 10.7761V16.0292C21.9956 16.4717 21.963 16.9135 21.8991 17.3513C21.7775 18.1241 21.5057 18.8656 21.0989 19.5342C20.9119 19.8571 20.6849 20.1553 20.4231 20.4215C19.2383 21.5089 17.665 22.0749 16.0574 21.9921H7.93061C6.32049 22.0743 4.74462 21.5086 3.55601 20.4215C3.2974 20.1547 3.07337 19.8566 2.88915 19.5342C2.48475 18.8661 2.21869 18.1238 2.1067 17.3513C2.03549 16.9142 1.99981 16.4721 2 16.0292V10.7761C1.99983 10.3374 2.02357 9.89902 2.07113 9.46288C2.08113 9.38636 2.09614 9.31109 2.11098 9.23659C2.13573 9.11241 2.16005 8.99038 2.16005 8.86836C2.25031 8.34204 2.41496 7.83116 2.64908 7.35101C3.34261 5.86916 4.76525 5.11492 7.09481 5.11492H16.8754C18.1802 5.01401 19.4753 5.4068 20.5032 6.21522C20.6215 6.3156 20.7316 6.4254 20.8321 6.54353ZM6.97033 15.5412H17.0355H17.0533C17.2741 15.5507 17.4896 15.4717 17.6517 15.3217C17.8137 15.1716 17.9088 14.963 17.9157 14.7425C17.9282 14.5487 17.8644 14.3577 17.7379 14.2101C17.5924 14.0118 17.3618 13.8935 17.1155 13.8907H6.97033C6.51365 13.8907 6.14343 14.2602 6.14343 14.7159C6.14343 15.1717 6.51365 15.5412 6.97033 15.5412Z"
                                                    fill="currentColor"></path>
                                            </svg>
                                         Ce dossier est trop volumineux pour être affiché dans le navigateur, la limite est de 300 fichiers maximum.
                                         </div>`;
          } else {
            if (json_files.data[i].attributes.mimetype == "inode/directory") {
              document.getElementById("files-explorer").innerHTML += `<div onclick="select_file(${directory + "/" + json_files.data[i].attributes.name})" ondblclick="load_files('${directory + "/" + json_files.data[i].attributes.name}')" class="list-group-item list-group-item-action not-selectable">
                                            <svg width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.4" d="M16.8843 5.11485H13.9413C13.2081 5.11969 12.512 4.79355 12.0474 4.22751L11.0782 2.88762C10.6214 2.31661 9.9253 1.98894 9.19321 2.00028H7.11261C3.37819 2.00028 2.00001 4.19201 2.00001 7.91884V11.9474C1.99536 12.3904 21.9956 12.3898 21.9969 11.9474V10.7761C22.0147 7.04924 20.6721 5.11485 16.8843 5.11485Z"
                                                    fill="currentColor"></path>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8321 6.54353C21.1521 6.91761 21.3993 7.34793 21.5612 7.81243C21.8798 8.76711 22.0273 9.77037 21.9969 10.7761V16.0292C21.9956 16.4717 21.963 16.9135 21.8991 17.3513C21.7775 18.1241 21.5057 18.8656 21.0989 19.5342C20.9119 19.8571 20.6849 20.1553 20.4231 20.4215C19.2383 21.5089 17.665 22.0749 16.0574 21.9921H7.93061C6.32049 22.0743 4.74462 21.5086 3.55601 20.4215C3.2974 20.1547 3.07337 19.8566 2.88915 19.5342C2.48475 18.8661 2.21869 18.1238 2.1067 17.3513C2.03549 16.9142 1.99981 16.4721 2 16.0292V10.7761C1.99983 10.3374 2.02357 9.89902 2.07113 9.46288C2.08113 9.38636 2.09614 9.31109 2.11098 9.23659C2.13573 9.11241 2.16005 8.99038 2.16005 8.86836C2.25031 8.34204 2.41496 7.83116 2.64908 7.35101C3.34261 5.86916 4.76525 5.11492 7.09481 5.11492H16.8754C18.1802 5.01401 19.4753 5.4068 20.5032 6.21522C20.6215 6.3156 20.7316 6.4254 20.8321 6.54353ZM6.97033 15.5412H17.0355H17.0533C17.2741 15.5507 17.4896 15.4717 17.6517 15.3217C17.8137 15.1716 17.9088 14.963 17.9157 14.7425C17.9282 14.5487 17.8644 14.3577 17.7379 14.2101C17.5924 14.0118 17.3618 13.8935 17.1155 13.8907H6.97033C6.51365 13.8907 6.14343 14.2602 6.14343 14.7159C6.14343 15.1717 6.51365 15.5412 6.97033 15.5412Z"
                                                    fill="currentColor"></path>
                                            </svg>
                                         ${json_files.data[i].attributes.name}</div>`;
            } else {
              document.getElementById("files-explorer").innerHTML += `<div onclick="select_file(${directory + "/" + json_files.data[i].attributes.name})" ondblclick="load_filecontent('${directory + "/" + json_files.data[i].attributes.name}', ${i})" class="list-group-item list-group-item-action not-selectable">
                                          <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.4" d="M18.8088 9.021C18.3573 9.021 17.7592 9.011 17.0146 9.011C15.1987 9.011 13.7055 7.508 13.7055 5.675V2.459C13.7055 2.206 13.5036 2 13.253 2H7.96363C5.49517 2 3.5 4.026 3.5 6.509V17.284C3.5 19.889 5.59022 22 8.16958 22H16.0463C18.5058 22 20.5 19.987 20.5 17.502V9.471C20.5 9.217 20.299 9.012 20.0475 9.013C19.6247 9.016 19.1177 9.021 18.8088 9.021Z" fill="currentColor"></path>
                                                <path opacity="0.4" d="M16.0842 2.56737C15.7852 2.25637 15.2632 2.47037 15.2632 2.90137V5.53837C15.2632 6.64437 16.1742 7.55437 17.2802 7.55437C17.9772 7.56237 18.9452 7.56437 19.7672 7.56237C20.1882 7.56137 20.4022 7.05837 20.1102 6.75437C19.0552 5.65737 17.1662 3.69137 16.0842 2.56737Z" fill="currentColor"></path>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.97398 11.3877H12.359C12.77 11.3877 13.104 11.0547 13.104 10.6437C13.104 10.2327 12.77 9.89868 12.359 9.89868H8.97398C8.56298 9.89868 8.22998 10.2327 8.22998 10.6437C8.22998 11.0547 8.56298 11.3877 8.97398 11.3877ZM8.97408 16.3819H14.4181C14.8291 16.3819 15.1631 16.0489 15.1631 15.6379C15.1631 15.2269 14.8291 14.8929 14.4181 14.8929H8.97408C8.56308 14.8929 8.23008 15.2269 8.23008 15.6379C8.23008 16.0489 8.56308 16.3819 8.97408 16.3819Z" fill="currentColor"></path>
                                            </svg>
                                         ${json_files.data[i].attributes.name}</div>`;
            }
          }
        }
      } else {
        if (json_files.code == 403) {
          window.location.replace("/dashboard/auth/sign-in.html");
        }
        if (json_files.code == 404) {
          window.location.replace("/dashboard/auth/sign-in.html");
        }
        if (json_files.code == 429) {
          window.location.replace("/dashboard/errors/error429.html");
        }
      }
    })
    .catch((error) => {
      // if (toString(error).includes("Cannot set properties of null (setting 'innerHTML')")) {console.log(" [ERROR] API fetch error " + error)}
      // window.location.replace("/dashboard/errors/error500.html")
      console.log(error);
    });
}
document.getElementById("editor").hidden = true;
document.getElementById("editor-mode").hidden = true;
document.getElementById("save-filecontent-btn").hidden = true;
document.getElementById("editor-back-button").hidden = true;

function editor_back() {
  document.getElementById("editor").hidden = true;
  document.getElementById("editor-mode").hidden = true;
  document.getElementById("save-filecontent-btn").hidden = true;
  document.getElementById("editor-back-button").hidden = true;
  document.getElementById("files-explorer").hidden = false;
  document.getElementById("back-button").hidden = false;
  document.getElementById("file-details").innerHTML = `
        <div class="form-group">
            <div class="profile-img-edit position-relative img-padding" id="file-image">
                <svg width="123" viewBox="0 0 80 80" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.4"
                    d="M16.8843 5.11485H13.9413C13.2081 5.11969 12.512 4.79355 12.0474 4.22751L11.0782 2.88762C10.6214 2.31661 9.9253 1.98894 9.19321 2.00028H7.11261C3.37819 2.00028 2.00001 4.19201 2.00001 7.91884V11.9474C1.99536 12.3904 21.9956 12.3898 21.9969 11.9474V10.7761C22.0147 7.04924 20.6721 5.11485 16.8843 5.11485Z"
                    fill="currentColor"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M20.8321 6.54353C21.1521 6.91761 21.3993 7.34793 21.5612 7.81243C21.8798 8.76711 22.0273 9.77037 21.9969 10.7761V16.0292C21.9956 16.4717 21.963 16.9135 21.8991 17.3513C21.7775 18.1241 21.5057 18.8656 21.0989 19.5342C20.9119 19.8571 20.6849 20.1553 20.4231 20.4215C19.2383 21.5089 17.665 22.0749 16.0574 21.9921H7.93061C6.32049 22.0743 4.74462 21.5086 3.55601 20.4215C3.2974 20.1547 3.07337 19.8566 2.88915 19.5342C2.48475 18.8661 2.21869 18.1238 2.1067 17.3513C2.03549 16.9142 1.99981 16.4721 2 16.0292V10.7761C1.99983 10.3374 2.02357 9.89902 2.07113 9.46288C2.08113 9.38636 2.09614 9.31109 2.11098 9.23659C2.13573 9.11241 2.16005 8.99038 2.16005 8.86836C2.25031 8.34204 2.41496 7.83116 2.64908 7.35101C3.34261 5.86916 4.76525 5.11492 7.09481 5.11492H16.8754C18.1802 5.01401 19.4753 5.4068 20.5032 6.21522C20.6215 6.3156 20.7316 6.4254 20.8321 6.54353ZM6.97033 15.5412H17.0355H17.0533C17.2741 15.5507 17.4896 15.4717 17.6517 15.3217C17.8137 15.1716 17.9088 14.963 17.9157 14.7425C17.9282 14.5487 17.8644 14.3577 17.7379 14.2101C17.5924 14.0118 17.3618 13.8935 17.1155 13.8907H6.97033C6.51365 13.8907 6.14343 14.2602 6.14343 14.7159C6.14343 15.1717 6.51365 15.5412 6.97033 15.5412Z"
                    fill="currentColor"></path>
                </svg>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label" for="name">Nom :</label>
            <input class="form-control" id="file-name" placeholder="Nom du fichier">
        </div>
        <button onclick="save_file()" class="btn btn-primary col-md-12"
            id="save-file-btn">Enregistrer</button>
    `;
  load_files(back[back.length - 1]);
}

var file_path = "";

function load_filecontent(path, file_id) {
  document.getElementById("files-explorer").innerHTML =
    '<a class="list-group-item list-group-item"><div class="spinner-grow text-secondary" role="status"></div></a>';
  file_path = path;
  if (files_data[file_id].attributes != undefined) {
    document.getElementById("file-details").innerHTML = `
    <div class="form-group">
         <div class="profile-img-edit position-relative img-padding" id="file-image">
            <svg width="123" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.4" d="M18.8088 9.021C18.3573 9.021 17.7592 9.011 17.0146 9.011C15.1987 9.011 13.7055 7.508 13.7055 5.675V2.459C13.7055 2.206 13.5036 2 13.253 2H7.96363C5.49517 2 3.5 4.026 3.5 6.509V17.284C3.5 19.889 5.59022 22 8.16958 22H16.0463C18.5058 22 20.5 19.987 20.5 17.502V9.471C20.5 9.217 20.299 9.012 20.0475 9.013C19.6247 9.016 19.1177 9.021 18.8088 9.021Z" fill="currentColor"></path>
                <path opacity="0.4" d="M16.0842 2.56737C15.7852 2.25637 15.2632 2.47037 15.2632 2.90137V5.53837C15.2632 6.64437 16.1742 7.55437 17.2802 7.55437C17.9772 7.56237 18.9452 7.56437 19.7672 7.56237C20.1882 7.56137 20.4022 7.05837 20.1102 6.75437C19.0552 5.65737 17.1662 3.69137 16.0842 2.56737Z" fill="currentColor"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.97398 11.3877H12.359C12.77 11.3877 13.104 11.0547 13.104 10.6437C13.104 10.2327 12.77 9.89868 12.359 9.89868H8.97398C8.56298 9.89868 8.22998 10.2327 8.22998 10.6437C8.22998 11.0547 8.56298 11.3877 8.97398 11.3877ZM8.97408 16.3819H14.4181C14.8291 16.3819 15.1631 16.0489 15.1631 15.6379C15.1631 15.2269 14.8291 14.8929 14.4181 14.8929H8.97408C8.56308 14.8929 8.23008 15.2269 8.23008 15.6379C8.23008 16.0489 8.56308 16.3819 8.97408 16.3819Z" fill="currentColor"></path>
            </svg>
        </div>
    </div>
    <div class="form-group">
        <label class="form-label" for="name">Nom :</label>
        <input class="form-control" id="file-name" placeholder="Nom du fichier" value="${files_data[file_id].attributes.name
      }">
    </div>
    <div class="form-group">
        <label class="form-label" for="name">Créé le : ${files_data[file_id].attributes.created_at
      }</label>
    </div>
    <div class="form-group">
        <label class="form-label" for="name">Modifé le : ${files_data[file_id].attributes.modified_at
      }</label>
    </div>
    <div class="form-group">
        <label class="form-label" for="name">Taille : ${Math.round(
        (files_data[file_id].attributes.size / (1024 * 1024)) * 100
      ) /
      100 +
      "Mo"
      }</label>
    </div>
    <div class="form-group">
        <label class="form-label" for="name">Permissions :</label>
        <input class="form-control" id="file-name" placeholder="Permissions du fichier" value="${files_data[file_id].attributes.mode
      }">
    </div>
    <button onclick="save_file()" class="btn btn-primary col-md-12"
        id="save-file-btn">Enregistrer</button>
    `;
  }
  document.getElementById("file-name").classList.remove("disabled");
  document.getElementById("save-file-btn").classList.remove("disabled");
  document.getElementById("file-title").innerHTML =
    files_data[file_id].attributes.name;
  fetch(`https://dash.mercurycloud.fr:8000/api/services/${url.searchParams.get("id")}/file?uuid=${getCookie("uuid")}&token=${getCookie("token")}&path=${path}`)
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      document.getElementById("files-explorer").hidden = true;
      document.getElementById("back-button").hidden = true;
      document.getElementById("editor").hidden = false;
      document.getElementById("editor-mode").hidden = false;
      document.getElementById("save-filecontent-btn").hidden = false;
      document.getElementById("editor-back-button").hidden = false;
      editor.setValue(data, -1);
    })
    .catch((error) => {
      window.location.replace("/dashboard/errors/error500.html");
      console.log("[ERROR] File content fetch error " + error);
    });
}

function save_file_content() {
  document.getElementById("save-filecontent-btn").classList.add("disabled");
  document.getElementById(
    "save-filecontent-btn"
  ).innerHTML = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>`;
  body = editor.getValue();
  fetch(`https://dash.mercurycloud.fr:8000/api/services/${url.searchParams.get("id")}/file?uuid=${getCookie("uuid")}&token=${getCookie("token")}&path=${file_path}`, {
    method: "PUT",
    body: body,
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      document.getElementById("save-filecontent-btn").classList.remove("disabled");
      document.getElementById("save-filecontent-btn").innerHTML = `Enregistrer`;
    })
    .catch((error) => {
      console.log("[ERROR] File content write error " + error);
      window.location.replace("/dashboard/errors/error500.html");
    });
}

function select_file(path) { }

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal"));
fitAddon.fit();
const url = new URL(window.location.href);
if (url.searchParams.get("id")) {
  fetch(`https://dash.mercurycloud.fr:8000/api/services/${url.searchParams.get("id")}?uuid=${getCookie("uuid")}&token=${getCookie("token")}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.error === false) {
        term.writeUtf8("Connexion au terminal en cours...\r\n");
        var cpu_series = [];
        var ram_series = [];
        var disk_series = [];
        var net_series = [];
        load_files("/");
        const cpu_chart_options = {
          chart: {
            height: 80,
            type: "area",
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 3,
            curve: "smooth",
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.5,
              opacityTo: 0,
            },
          },

          series: [{
            name: "CPU",
            data: [],
          },],
          colors: ["#344ed1"],

          xaxis: {
            categories: [
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ],
          },
          noData: {
            text: "Chargement...",
          },
          tooltip: {
            enabled: true,
          },
        };
        const cpu_chart = new ApexCharts(
          document.querySelector("#cpu-chart"),
          cpu_chart_options
        );
        cpu_chart.render();
        const ram_chart_option = {
          chart: {
            height: 80,
            type: "area",
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 3,
            curve: "smooth",
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.5,
              opacityTo: 0,
            },
          },

          series: [{
            name: "RAM",
            data: [],
          },],
          colors: ["#d95f18"],

          xaxis: {
            categories: [
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ],
          },
          noData: {
            text: "Chargement...",
          },
          tooltip: {
            enabled: true,
          },
        };
        const ram_chart = new ApexCharts(
          document.querySelector("#ram-chart"),
          ram_chart_option
        );
        ram_chart.render();
        const disk_chart_option = {
          chart: {
            height: 80,
            type: "area",
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 3,
            curve: "smooth",
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.5,
              opacityTo: 0,
            },
          },

          series: [{
            name: "Disque",
            data: [],
          },],
          colors: ["#17904b"],

          xaxis: {
            categories: [
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ],
          },
          noData: {
            text: "Chargement...",
          },
          tooltip: {
            enabled: true,
          },
        };
        const disk_chart = new ApexCharts(
          document.querySelector("#disk-chart"),
          disk_chart_option
        );
        disk_chart.render();
        const net_chart_option = {
          chart: {
            height: 80,
            type: "area",
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 3,
            curve: "smooth",
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.5,
              opacityTo: 0,
            },
          },

          series: [{
            name: "Réseau",
            data: [],
          },],
          colors: ["#ad2d1e"],

          xaxis: {
            categories: [
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ],
          },
          noData: {
            text: "Chargement...",
          },
          tooltip: {
            enabled: true,
          },
        };
        const net_chart = new ApexCharts(
          document.querySelector("#net-chart"),
          net_chart_option
        );
        net_chart.render();
        const socket = new WebSocket(json.data.websocket.websocket_url);

        socket.onopen = function (e) {
          socket.send(
            `{ "event": "auth", "args": ["${json.data.websocket.websocket_token}"] }`
          );
          term.writeUtf8("Terminal connecté avec succès.\r\n");
        };

        function set_state(state) {
          socket.send(`{"event":"set state","args":["${state}"]}`);
        }

        document
          .getElementById("start-button")
          .addEventListener("click", function () {
            set_state("start");
          });
        document
          .getElementById("restart-button")
          .addEventListener("click", function () {
            term.writeUtf8("Votre serveur redémarre...\r\n");
            set_state("restart");
          });
        document
          .getElementById("stop-button")
          .addEventListener("click", function () {
            set_state("stop");
          });
        document
          .getElementById("kill-button")
          .addEventListener("click", function () {
            set_state("kill");
          });

        socket.addEventListener("message", function (event) {
          data_parse = JSON.parse(event.data);
          if (
            data_parse.event == "token expiring" ||
            data_parse.event == "token expired"
          ) {
            window.location.reload();
          }
          if (data_parse.event == "status") {
            if (data_parse.args[0] == "offline") {
              document
                .getElementById("restart-button")
                .classList.add("disabled");
              document.getElementById("stop-button").classList.add("disabled");
              document.getElementById("kill-button").classList.add("disabled");
              document
                .getElementById("start-button")
                .classList.remove("disabled");
              term.clear();
              term.writeUtf8("Votre serveur est éteint.\r\n");
            }
            if (data_parse.args[0] == "running") {
              document.getElementById("start-button").classList.add("disabled");
              document
                .getElementById("restart-button")
                .classList.remove("disabled");
              document
                .getElementById("stop-button")
                .classList.remove("disabled");
              document
                .getElementById("kill-button")
                .classList.remove("disabled");
              term.writeUtf8("Votre serveur est démarré.\r\n");
            }
            if (data_parse.args[0] == "stopping") {
              document
                .getElementById("restart-button")
                .classList.add("disabled");
              document.getElementById("stop-button").classList.add("disabled");
              document
                .getElementById("start-button")
                .classList.remove("disabled");
              document
                .getElementById("kill-button")
                .classList.remove("disabled");
              term.writeUtf8("Votre serveur est en cours d'extinction...\r\n");
            }
            if (data_parse.args[0] == "starting") {
              document.getElementById("start-button").classList.add("disabled");
              document
                .getElementById("restart-button")
                .classList.remove("disabled");
              document
                .getElementById("stop-button")
                .classList.remove("disabled");
              document
                .getElementById("kill-button")
                .classList.remove("disabled");
              term.clear();
              term.writeUtf8("Votre serveur démarre...\r\n");
            }
          }
          if (data_parse.event == "stats") {
            args_parse = JSON.parse(data_parse.args[0]);
            document.getElementById("cpu-counter").innerHTML =
              Math.round(args_parse.cpu_absolute * 100) / 100 + "%";
            document.getElementById("ram-counter").innerHTML =
              Math.round(
                (args_parse.memory_bytes / (1024 * 1024 * 1024)) * 100
              ) /
              100 +
              "Go";
            document.getElementById("disk-counter").innerHTML =
              Math.round((args_parse.disk_bytes / (1024 * 1024 * 1024)) * 100) / 100 + "Go";
            document.getElementById("net-counter").innerHTML =
              (Math.round(((args_parse.network.rx_bytes + args_parse.network.tx_bytes) / (1024 * 1024)) * 100) / 100) * 8 + "Mb/s";
            document.getElementById("disk-counter-span").innerHTML = Math.round((args_parse.disk_bytes / (1024 * 1024)) * 100) / 100 + "Mo";
            document.getElementById("ram-counter-span").innerHTML = "sur " + Math.round((args_parse.memory_limit_bytes / (1024 * 1024 * 1024)) * 10) / 10 + "Go";
            document.getElementById("net-counter-span").innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="10px" height="10px" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                       d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                                       clip-rule="evenodd"></path>
                                </svg>
                                 ${(Math.round((args_parse.network.rx_bytes / 1024000) * 100) / 100) * 8}Mb/s
                                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                ${(Math.round((args_parse.network.tx_bytes / 1024000) * 100) / 100) * 8}Mb/s`;
            if (cpu_series.length > 14) {
              cpu_series.shift();
            }
            cpu_series.push(Math.round(args_parse.cpu_absolute * 100) / 100);
            cpu_chart.updateSeries([{
              name: "CPU",
              data: cpu_series,
            },]);

            if (ram_series.length > 14) {
              ram_series.shift();
            }
            ram_series.push(
              Math.round((args_parse.memory_bytes / (1024 * 1024 * 1024)) * 100) / 100 + "Go"
            );
            ram_chart.updateSeries([{
              name: "RAM",
              data: ram_series,
            },]);

            if (disk_series.length > 14) {
              disk_series.shift();
            }
            disk_series.push(
              Math.round((args_parse.disk_bytes / (1024 * 1024 * 1024)) * 100) / 100 + "Go"
            );
            disk_chart.updateSeries([{
              name: "Disque",
              data: disk_series,
            },]);

            if (net_series.length > 14) {
              net_series.shift();
            }
            net_series.push(
              (Math.round(((args_parse.network.rx_bytes + args_parse.network.tx_bytes) / 1024000) * 100) / 100) * 8);
            net_chart.updateSeries([{
              name: "Réseau",
              data: net_series,
            },]);
          }
          if (data_parse.event == "console output") {
            term.writeUtf8(data_parse.args[0] + "\r\n");
            fitAddon.fit();
          }
        });

        var commands_history = [];
        var terminal_input = document.getElementById("terminal-input");
        terminal_input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            socket.send(
              `{ "event": "send command", "args": ["${terminal_input.value}"] } `
            );
            commands_history.push(terminal_input.value);
            if (commands_history.length > 100) {
              commands_history.shift();
            }
            terminal_input.value = "";
          }
          if (event.key === "ArrowUp") {
            if (commands_history[commands_history.length - 1] != undefined) {
              terminal_input.value =
                commands_history[commands_history.length - 1];
            }
          }
        });

        socket.onclose = function (event) {
          if (event.wasClean) {
            console.log(
              `[INFO] Websocket connection closed cleanly, code = ${event.code} reason = ${event.reason} `
            );
            term.writeUtf8(
              "Terminal deconnecté avec succès. Raison : " +
              event.reason +
              "\r\n"
            );
          } else {
            console.log("[ERROR] Websocket connection died");
            term.writeUtf8("Connexion au terminal interrompu !\r\n");
          }
        };

        socket.onerror = function (error) {
          console.log(`[error] ${error.message} `);
        };
      } else {
        if (json.code == 403) {
          window.location.replace("/dashboard/auth/sign-in.html");
        }
        if (json.code == 404) {
          window.location.replace("/dashboard/auth/sign-in.html");
        }
        if (json.code == 429) {
          window.location.replace("/dashboard/errors/error429.html");
        }
      }
    })
    .catch((error) => {
      window.location.replace("/dashboard/errors/error500.html")
    });
} else {
  window.location.replace("/dashboard/errors/error404.html");
}