function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function putData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
            
            
        },
        body: JSON.stringify(data)
    });
    return response.json()
}

var role_id = ""
const url = new URL(window.location.href);
if (url.searchParams.get('id')) {
    fetch(api_url + `roles/${url.searchParams.get('id')}`, {
        headers: {
            
            
        }
    }).then(function (response) {
        return response.json();
    })
        .then(function (json) {
            if (json.error === false) {
                if (json.data.uuid == 404) {
                    window.location.replace("/errors/error404.html");
                } else {
                    document.getElementById("title").innerHTML = `Mercury Cloud | Edition du rôle ${json.data.name}`
                    document.getElementById("role-title").innerHTML = `Edition du rôle ${json.data.name}`
                    document.getElementById("role-name").value = json.data.name
                    if (json.data.permissions != "NONE") {
                        const role_permissions = json.data.permissions.split(",");
                        for (let i = 0; i < role_permissions.length; ++i) {
                            document.getElementById(role_permissions[i]).checked = true
                        }
                        admin_click()
                    }
                    role_id = json.data.id
                }
            } else {
                window.location.replace("/errors/error500.html");
            }
        })
} else {
    window.location.replace("/errors/error404.html");
}

function admin_click() {
    const unchecked_array = ["VIEWADMINPANEL", "LISTUSERS", "CREATEUSER", "DELETEUSER", "EDTIUSER", "LISTROLES", "CREATEROLE", "DELETEROLE", "EDITROLE", "LISTPRODUCTS", "CREATEPRODUCT", "DELETEPRODUCT", "EDITPRODUCT", "LISTSERVICES", "CREATESERVICE", "DELETESERVICE", "EDITSERVICE"]
    if (document.getElementById("ADMIN").checked) {
        for (let i = 0; i < unchecked_array.length; ++i) {
            document.getElementById(unchecked_array[i]).setAttribute("disabled", "")
        }
    } else {
        for (let i = 0; i < unchecked_array.length; ++i) {
            document.getElementById(unchecked_array[i]).removeAttribute("disabled", "")
        }
    }
}

function save_role() {
    var ok = 0
    var no = 0
    if (document.getElementById("role-name").value.length > 2) {
        document.getElementById("role-name").classList.remove('is-invalid')
        document.getElementById("role-name").classList.add('is-valid')
        ok++
    } else {
        document.getElementById("role-name").classList.remove('is-valid')
        document.getElementById("role-name").classList.add('is-invalid')
        document.getElementById("role-name").value = ""
        no++
    }

    if (ok == 1 && no == 0) {
        var permissions = []
        const permissions_array = ["ADMIN", "VIEWADMINPANEL", "LISTUSERS", "CREATEUSER", "DELETEUSER", "EDTIUSER", "LISTROLES", "CREATEROLE", "DELETEROLE", "EDITROLE", "LISTPRODUCTS", "CREATEPRODUCT", "DELETEPRODUCT", "EDITPRODUCT", "LISTSERVICES", "CREATESERVICE", "DELETESERVICE", "EDITSERVICE"]
        if (document.getElementById("ADMIN").checked) {
            permissions.push("ADMIN")
        } else {
            for (let i = 0; i < permissions_array.length; ++i) {
                if (document.getElementById(permissions_array[i]).checked) {
                    permissions.push(permissions_array[i])
                    console.log("[DEBUG] Permission " + permissions_array[i] + " added !")
                }
            }
        }
        body = {
            "name": document.getElementById("role-name").value,
            "permissions": permissions
        }

        putData(api_url + `roles/${role_id}`, body).then(data => {
            if (data.error == false) {
                window.location.reload()
            } else {
                console.log('[ERROR] Code : ' + data.code + ' Message : ' + data.msg);
                if (data.code == 403) {
                    location.href = "../errors/error403.html"
                } else {
                    location.href = "../errors/error500.html"
                }
            }
        })
    }
}