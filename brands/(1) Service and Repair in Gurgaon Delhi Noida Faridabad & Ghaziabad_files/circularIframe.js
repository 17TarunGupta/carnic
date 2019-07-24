// global variables
var _collapsed = true;

window.addEventListener("message", onMessage_window, false);
function onMessage_window(evt) {
    if (evt.type && evt.origin === location.origin) {
        // console.log("circular iframe: ", evt);
        var type = evt.data.type;
        var data = evt.data.data;
        switch (type) {
            case "Collapse":
                collapse(data);
                break;
            case "Expand":
                expand(data);
                break;
            case "Notification":
                updateCount(data);
                break;
            case "Config":
                updateCss(data);
                break;

        }

    }
    else {
        console.log("false: ", evt);
    }
}
function postMessageTo_window(obj) {
    parent.postMessage(obj, location.origin)
}

function toggle() {
    _collapsed = !_collapsed;
    if (_collapsed)
        collapse();
    else
        expand();
}

function collapse(data) {
    _collapsed = true;
    var d = {
        type: "Collapse",
        collapse: _collapsed,
    };
    if (data && data.data) {
        d = Object.assign({}, d, data.data);
    }
    postMessageTo_window(d);
    el = document.getElementsByTagName("body")[0];
    try {
      el.classList.add('collapsed');
    }
    catch (e) {
      console.log(e);
    }
}

function expand(data) {
    _collapsed = false;
    var d = {
        type: "Expand",
        collapse: _collapsed,
    };
    if (data && data.data) {
        d = Object.assign({}, d, data.data);
    }
    postMessageTo_window(d);
    var el = document.getElementsByTagName("body")[0];
    try {
      el.classList.remove('collapsed');
    }
    catch (e) {
      console.log(e);
    }
    updateCount({ data: { count: 0 } });
}

function updateCount(data) {
  if (!checkNaN(data.data.count)) {
    var el = document.getElementById("totalMessageCount");
      try {
        el.innerText = data.data.count;
        // document.addEventListener('notificationCount' , function (e) {
        //   console.log(e);
        // });
        // var unreadCountChanged = new CustomEvent("notificationCount", { detail: { count: data.data.count } });
        // document.dispatchEvent(unreadCountChanged);
        if (data.data.count <= 0)
            el.classList.add("hidden");
        else
            if (_collapsed) {
              el.classList.remove('hidden');
            }
      }
        catch (e) {
            console.log("error");
      }
    }
}

function updateCss(data) {
    document.documentElement.style.setProperty('--color', data.data["color-theme"]);
    postMessageTo_window({
        type: "ConfigCompleted"
    });
    try {
      document.getElementById("fuguLauncherContainer").classList.remove('hidden');
    }
    catch (e) {
      console.log(e);
    }
}
function checkNaN(data) {
  return data !== data;
}
