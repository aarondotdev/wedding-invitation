(function () {
  try {
    var element = document.documentElement;
    var data = JSON.parse(element.getAttribute("data-theme-preview") || "null");
    if (!data) return;

    var saved = JSON.parse(localStorage.getItem(data.key) || "null");
    if (!saved) return;

    var selection = {};
    for (var key in data.defaults) {
      selection[key] = data.ids[key].indexOf(saved[key]) >= 0 ? saved[key] : data.defaults[key];
    }

    var variables = Object.assign({}, data.themeVars[selection.theme]);
    var fontVariables = data.fontVars[selection.font];
    ["--font-display", "--font-sans", "--font-script"].forEach(function (name) {
      variables[name] = fontVariables[name];
    });

    document.querySelectorAll("[data-theme-scope]").forEach(function (scope) {
      for (var key in selection) scope.setAttribute("data-" + key, selection[key]);
      for (var name in variables) scope.style.setProperty(name, variables[name]);
    });
  } catch {}
})();
