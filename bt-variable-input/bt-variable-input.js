/**
 * BT Variable Input v1.1.0
 * Author: Godja Vasile
 *
 * Pro Qlik Sense variable input extension with:
 *  - 6 control types: Text Input, Number Input, Slider, Dropdown, Button Group, Date Picker
 *  - Multiple variable controls in one extension (array)
 *  - Dropdown variable selector (lists app variables)
 *  - Fixed or dynamic values (expression-driven)
 *  - Custom labels, placeholders, tooltips
 *  - Horizontal / Vertical layout
 *  - Grouped controls with section headers
 *  - Accent color (15 presets + custom HEX)
 *  - Dark mode (Auto / Light / Dark)
 *  - Keyboard navigation + ARIA accessibility
 *  - No external dependencies, works offline
 *
 * Compatible with Qlik Sense Enterprise 2024+ and Qlik Cloud.
 */
define(["jquery", "qlik"], function ($, qlik) {
  "use strict";

  // ── CSS (scoped: bt-vi) ──────────────────────────────────
  var css = [
    ".bt-vi-root{width:100%;height:100%;box-sizing:border-box;overflow:auto;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;padding:6px}",
    ".bt-vi-root.dark{background:#1e293b;color:#e2e8f0}",

    ".bt-vi-wrap{display:flex;gap:12px}",
    ".bt-vi-wrap.horizontal{flex-direction:row;flex-wrap:wrap;align-items:flex-end}",
    ".bt-vi-wrap.vertical{flex-direction:column}",

    ".bt-vi-group{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;padding:6px 0 2px;border-bottom:1.5px solid #e2e8f0;margin-top:6px;width:100%}",
    ".bt-vi-group:first-child{margin-top:0}",
    ".bt-vi-root.dark .bt-vi-group{color:#94a3b8;border-bottom-color:#334155}",

    ".bt-vi-ctrl{display:flex;flex-direction:column;gap:3px;min-width:140px;position:relative}",
    ".bt-vi-wrap.horizontal .bt-vi-ctrl{flex:1;max-width:300px}",
    ".bt-vi-ctrl-label{font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px}",
    ".bt-vi-root.dark .bt-vi-ctrl-label{color:#94a3b8}",

    ".bt-vi-tip{position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);background:#1e293b;color:#f1f5f9;padding:4px 10px;border-radius:5px;font-size:10px;white-space:normal;text-align:center;max-width:220px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:10000;line-height:1.4}",
    ".bt-vi-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e293b}",
    ".bt-vi-ctrl:hover .bt-vi-tip{opacity:1}",

    ".bt-vi-input{padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:13px;color:#334155;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;box-sizing:border-box;font-family:inherit}",
    ".bt-vi-root.dark .bt-vi-input{background:#0f172a;border-color:#475569;color:#e2e8f0}",

    ".bt-vi-slider-wrap{display:flex;align-items:center;gap:8px}",
    ".bt-vi-slider{flex:1;-webkit-appearance:none;height:6px;border-radius:3px;background:#e2e8f0;outline:none}",
    ".bt-vi-root.dark .bt-vi-slider{background:#475569}",
    ".bt-vi-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2)}",
    ".bt-vi-slider-val{font-family:'Courier New',monospace;font-size:12px;font-weight:700;min-width:36px;text-align:right}",

    ".bt-vi-select{padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:13px;color:#334155;background:#fff;outline:none;cursor:pointer;width:100%;box-sizing:border-box;font-family:inherit;-webkit-appearance:none;appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 8px center;background-size:16px;padding-right:28px}",
    ".bt-vi-root.dark .bt-vi-select{background:#0f172a;border-color:#475569;color:#e2e8f0}",

    ".bt-vi-btngroup{display:flex;gap:0;border-radius:6px;overflow:hidden;border:1.5px solid #e2e8f0}",
    ".bt-vi-root.dark .bt-vi-btngroup{border-color:#475569}",
    ".bt-vi-btngroup-item{padding:6px 14px;font-size:12px;font-weight:500;cursor:pointer;background:#fff;color:#64748b;border:none;border-right:1px solid #e2e8f0;transition:all .15s;flex:1;text-align:center;font-family:inherit}",
    ".bt-vi-btngroup-item:last-child{border-right:none}",
    ".bt-vi-root.dark .bt-vi-btngroup-item{background:#0f172a;color:#94a3b8;border-right-color:#334155}",
    ".bt-vi-btngroup-item.active{color:#fff;font-weight:600}",
    ".bt-vi-btngroup-item:hover:not(.active){background:#f1f5f9}",
    ".bt-vi-root.dark .bt-vi-btngroup-item:hover:not(.active){background:#1e293b}",

    ".bt-vi-date{padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:13px;color:#334155;background:#fff;outline:none;width:100%;box-sizing:border-box;font-family:inherit}",
    ".bt-vi-root.dark .bt-vi-date{background:#0f172a;border-color:#475569;color:#e2e8f0}",

    ".bt-vi-curval{font-size:10px;color:#94a3b8;font-family:'Courier New',monospace;margin-top:1px}",

    ".bt-vi-empty{padding:12px;font-size:12px;color:#94a3b8}"
  ].join("");

  if (!$("#bt-vi-styles").length) {
    $("<style id='bt-vi-styles'>").html(css).appendTo("head");
  }

  // ── Helpers ──────────────────────────────────────────────
  function esc(t) { return $("<div>").text(t).html(); }

  function stripBorders($el) {
    var $n = $el;
    for (var i = 0; i < 5; i++) {
      $n.css({ background: "transparent", border: "none", boxShadow: "none", outline: "none" });
      $n = $n.parent();
      if (!$n.length || $n.is("body")) break;
    }
  }

  function getVar(app, name) {
    return new Promise(function (resolve) {
      try {
        app.variable.getContent(name, function (reply) {
          resolve(reply && reply.qContent ? reply.qContent.qString : "");
        });
      } catch (e) { resolve(""); }
    });
  }

  function setVar(enigmaApp, app, name, value) {
    if (enigmaApp) {
      enigmaApp.getVariableByName(name)
        .then(function (v) { return v.setStringValue(String(value)); })
        .catch(function () { try { app.variable.setStringValue(name, String(value)); } catch (e) {} });
    } else {
      try { app.variable.setStringValue(name, String(value)); } catch (e) {}
    }
  }

  function fetchVariableList(enigmaApp) {
    if (!enigmaApp) return Promise.resolve([]);
    return enigmaApp.createSessionObject({
      qVariableListDef: { qType: "variable", qShowReserved: false, qShowConfig: false, qData: { tags: "/tags" } },
      qInfo: { qType: "VariableList" }
    }).then(function (obj) {
      return obj.getLayout().then(function (ly) {
        var list = ly.qVariableList && ly.qVariableList.qItems
          ? ly.qVariableList.qItems.map(function (v) { return v.qName; }).sort() : [];
        enigmaApp.destroySessionObject(obj.id).catch(function () {});
        return list;
      });
    }).catch(function () { return []; });
  }

  function detectDark(mode) {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    if ($("body").hasClass("qv-dark") || $("body").hasClass("dark")) return true;
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
  }

  function resolveColor(hex) {
    if (!hex || typeof hex !== "string") return null;
    hex = hex.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(hex)) return hex[0] === "#" ? hex : "#" + hex;
    return null;
  }

  function parseOptions(str) {
    if (!str || !str.trim()) return [];
    return str.split("|").map(function (item) {
      item = item.trim();
      if (!item) return null;
      var parts = item.split("~");
      if (parts.length >= 2) return { label: parts[0].trim(), value: parts[1].trim() };
      return { label: item, value: item };
    }).filter(function (x) { return x !== null; });
  }

  function parseItems(layout) {
    return (layout && layout.viItems && Array.isArray(layout.viItems))
      ? layout.viItems.filter(function (it) { return it && it.varName; }) : [];
  }

  // Fingerprint layout properties (not variable values) to detect structural changes
  function layoutFingerprint(layout) {
    var items = parseItems(layout);
    return JSON.stringify({
      o: layout.orientation,
      t: layout.themeMode,
      c: layout.accentColor,
      cc: layout.customAccentColor,
      sv: layout.showCurrentValue,
      items: items.map(function (it) {
        return { v: it.varName, t: it.ctrlType, l: it.label, g: it.group, opts: it.optionsList,
                 mn: it.sliderMin, mx: it.sliderMax, st: it.sliderStep, ph: it.placeholder, tip: it.tooltip };
      })
    });
  }

  // Store last fingerprint per element to avoid re-rendering while user types
  var lastFP = {};

  // ── Extension ────────────────────────────────────────────
  return {
    paint: function ($el, layout) {
      var self = this, app = qlik.currApp(self), enigmaApp = null;
      try { enigmaApp = app.model.enigmaModel; } catch (e) {}

      var items    = parseItems(layout);
      var orient   = layout.orientation || "vertical";
      var darkMode = detectDark(layout.themeMode || "auto");
      var showCur  = layout.showCurrentValue !== false;

      var customColor = resolveColor(layout.customAccentColor);
      var accentColor = customColor || layout.accentColor || "#6366f1";

      // Skip re-render if only variable values changed (user is typing)
      var elId = $el.attr("id") || "bt-vi-" + Math.random();
      if (!$el.attr("id")) $el.attr("id", elId);
      var fp = layoutFingerprint(layout);
      var needsRender = (lastFP[elId] !== fp) || !$el.find(".bt-vi-root").length;
      lastFP[elId] = fp;

      if (!needsRender) return; // Don't destroy inputs while user is interacting

      stripBorders($el);

      if (!items.length) {
        $el.html('<div class="bt-vi-root' + (darkMode ? ' dark' : '') + '"><div class="bt-vi-empty">Add controls from the properties panel.</div></div>');
        return;
      }

      // Read all variable values
      Promise.all(items.map(function (it) {
        return getVar(app, it.varName).then(function (v) {
          return {
            varName: it.varName,
            label: it.label || it.varName,
            type: it.ctrlType || "text",
            value: v,
            placeholder: it.placeholder || "",
            tooltip: it.tooltip || "",
            group: it.group || "",
            options: it.optionsList || "",
            min: parseFloat(it.sliderMin) || 0,
            max: parseFloat(it.sliderMax) || 100,
            step: parseFloat(it.sliderStep) || 1
          };
        });
      })).then(function (ctrls) {

        var html = '<div class="bt-vi-root' + (darkMode ? ' dark' : '') + '">';
        html += '<div class="bt-vi-wrap ' + orient + '">';

        var curGroup = null;

        ctrls.forEach(function (c, idx) {
          if (c.group && c.group !== curGroup) {
            curGroup = c.group;
            html += '<div class="bt-vi-group">' + esc(c.group) + '</div>';
          }

          html += '<div class="bt-vi-ctrl">';
          if (c.tooltip) html += '<div class="bt-vi-tip">' + esc(c.tooltip) + '</div>';
          html += '<label class="bt-vi-ctrl-label">' + esc(c.label) + '</label>';

          switch (c.type) {
            case "text":
              html += '<input class="bt-vi-input" type="text" data-var="' + esc(c.varName) + '" value="' + esc(c.value) + '"' +
                (c.placeholder ? ' placeholder="' + esc(c.placeholder) + '"' : '') +
                ' style="border-color:#e2e8f0" aria-label="' + esc(c.label) + '">';
              break;

            case "number":
              html += '<input class="bt-vi-input" type="number" data-var="' + esc(c.varName) + '" value="' + esc(c.value) + '"' +
                (c.placeholder ? ' placeholder="' + esc(c.placeholder) + '"' : '') +
                ' style="border-color:#e2e8f0" aria-label="' + esc(c.label) + '">';
              break;

            case "slider":
              var slVal = parseFloat(c.value) || c.min;
              html += '<div class="bt-vi-slider-wrap">' +
                '<input class="bt-vi-slider" type="range" data-var="' + esc(c.varName) + '"' +
                ' min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + slVal + '"' +
                ' aria-label="' + esc(c.label) + '">' +
                '<span class="bt-vi-slider-val" style="color:' + accentColor + '">' + slVal + '</span></div>';
              break;

            case "dropdown":
              var opts = parseOptions(c.options);
              html += '<select class="bt-vi-select" data-var="' + esc(c.varName) + '" aria-label="' + esc(c.label) + '">';
              opts.forEach(function (o) {
                html += '<option value="' + esc(o.value) + '"' + (o.value === c.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
              });
              html += '</select>';
              break;

            case "buttons":
              var bOpts = parseOptions(c.options);
              html += '<div class="bt-vi-btngroup">';
              bOpts.forEach(function (o) {
                var isActive = o.value === c.value;
                html += '<button class="bt-vi-btngroup-item' + (isActive ? ' active' : '') + '"' +
                  ' data-var="' + esc(c.varName) + '" data-val="' + esc(o.value) + '"' +
                  ' style="' + (isActive ? 'background:' + accentColor + ';color:#fff' : '') + '">' +
                  esc(o.label) + '</button>';
              });
              html += '</div>';
              break;

            case "date":
              html += '<input class="bt-vi-date" type="date" data-var="' + esc(c.varName) + '" value="' + esc(c.value || "") + '"' +
                ' aria-label="' + esc(c.label) + '">';
              break;
          }

          if (showCur && c.type !== "slider") {
            html += '<span class="bt-vi-curval">= ' + esc(c.value || "(empty)") + '</span>';
          }

          html += '</div>';
        });

        html += '</div></div>';
        $el.html(html);

        // ── Stop Qlik from intercepting clicks on interactive elements ──
        $el.find(".bt-vi-input, .bt-vi-select, .bt-vi-date, .bt-vi-slider, .bt-vi-btngroup-item").on("mousedown click touchstart", function (e) {
          e.stopPropagation();
        });

        // ── Apply accent color to focused inputs ───────
        $el.find(".bt-vi-input, .bt-vi-select, .bt-vi-date").on("focus", function () {
          $(this).css({ borderColor: accentColor, boxShadow: "0 0 0 3px " + accentColor + "1f" });
        }).on("blur", function () {
          $(this).css({ borderColor: darkMode ? "#475569" : "#e2e8f0", boxShadow: "none" });
        });

        // ── Apply accent color to slider thumb ─────────
        $el.find(".bt-vi-slider").each(function () {
          // Inject per-slider accent via a scoped style
          var $sl = $(this);
          var id = "bt-vi-sl-" + Math.random().toString(36).substr(2, 6);
          $sl.attr("id", id);
          var thumbCss = "#" + id + "::-webkit-slider-thumb{background:" + accentColor + "} #" + id + "::-moz-range-thumb{background:" + accentColor + "}";
          $("<style>").html(thumbCss).appendTo("head");
        });

        // ── Event handlers ─────────────────────────────

        // Text / Number — set on Enter or blur
        $el.find(".bt-vi-input").on("keydown", function (e) {
          if (e.key === "Enter") {
            $(this).blur(); // triggers blur handler
          }
        }).on("blur", function () {
          var $inp = $(this);
          setVar(enigmaApp, app, $inp.data("var"), $inp.val());
          $inp.closest(".bt-vi-ctrl").find(".bt-vi-curval").text("= " + ($inp.val() || "(empty)"));
        });

        // Slider
        $el.find(".bt-vi-slider").on("input", function () {
          var $sl = $(this), val = $sl.val();
          $sl.siblings(".bt-vi-slider-val").text(val);
          setVar(enigmaApp, app, $sl.data("var"), val);
        });

        // Dropdown
        $el.find(".bt-vi-select").on("change", function () {
          var $sel = $(this);
          setVar(enigmaApp, app, $sel.data("var"), $sel.val());
          $sel.closest(".bt-vi-ctrl").find(".bt-vi-curval").text("= " + $sel.val());
        });

        // Button group
        $el.find(".bt-vi-btngroup-item").on("click", function () {
          var $btn = $(this), $grp = $btn.closest(".bt-vi-btngroup");
          $grp.find(".bt-vi-btngroup-item").removeClass("active").css({ background: "", color: "" });
          $btn.addClass("active").css({ background: accentColor, color: "#fff" });
          setVar(enigmaApp, app, $btn.data("var"), $btn.data("val"));
          $btn.closest(".bt-vi-ctrl").find(".bt-vi-curval").text("= " + $btn.data("val"));
        });

        // Date
        $el.find(".bt-vi-date").on("change", function () {
          var $d = $(this);
          setVar(enigmaApp, app, $d.data("var"), $d.val());
          $d.closest(".bt-vi-ctrl").find(".bt-vi-curval").text("= " + $d.val());
        });
      });
    },

    // ── Definition ─────────────────────────────────────────
    definition: {
      type: "items",
      component: "accordion",
      items: {
        controls: {
          label: "Controls",
          type: "items",
          items: {
            viItems: {
              ref: "viItems", type: "array", label: "Variable Controls",
              itemTitleRef: "label", allowAdd: true, allowRemove: true, allowMove: true,
              addTranslation: "Add control",
              items: {
                varName: {
                  ref: "varName", label: "Variable", type: "string", defaultValue: "",
                  component: "dropdown",
                  options: function () {
                    var app = qlik.currApp(), ea = null;
                    try { ea = app.model.enigmaModel; } catch (e) {}
                    if (!ea) return [{ value: "", label: "(no engine)" }];
                    return fetchVariableList(ea).then(function (vars) {
                      return [{ value: "", label: "(select)" }].concat(vars.map(function (v) { return { value: v, label: v }; }));
                    });
                  }
                },
                label: { ref: "label", label: "Label", type: "string", defaultValue: "", expression: "optional" },
                ctrlType: {
                  ref: "ctrlType", label: "Control type", type: "string", component: "dropdown", defaultValue: "text",
                  options: [
                    { value: "text", label: "Text Input" },
                    { value: "number", label: "Number Input" },
                    { value: "slider", label: "Slider" },
                    { value: "dropdown", label: "Dropdown" },
                    { value: "buttons", label: "Button Group" },
                    { value: "date", label: "Date Picker" }
                  ]
                },
                optionsList: {
                  ref: "optionsList", label: "Options: Label1~Value1|Label2~Value2",
                  type: "string", defaultValue: "", expression: "optional",
                  show: function (d) { return d.ctrlType === "dropdown" || d.ctrlType === "buttons"; }
                },
                sliderMin: {
                  ref: "sliderMin", label: "Min", type: "string", defaultValue: "0",
                  show: function (d) { return d.ctrlType === "slider"; }
                },
                sliderMax: {
                  ref: "sliderMax", label: "Max", type: "string", defaultValue: "100",
                  show: function (d) { return d.ctrlType === "slider"; }
                },
                sliderStep: {
                  ref: "sliderStep", label: "Step", type: "string", defaultValue: "1",
                  show: function (d) { return d.ctrlType === "slider"; }
                },
                group: { ref: "group", label: "Group (optional)", type: "string", defaultValue: "" },
                placeholder: {
                  ref: "placeholder", label: "Placeholder", type: "string", defaultValue: "",
                  show: function (d) { return d.ctrlType === "text" || d.ctrlType === "number"; }
                },
                tooltip: { ref: "tooltip", label: "Tooltip", type: "string", defaultValue: "" }
              }
            }
          }
        },

        appearance: {
          label: "Appearance",
          type: "items",
          items: {
            orientation: {
              ref: "orientation", label: "Layout", type: "string", component: "buttongroup", defaultValue: "vertical",
              options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }]
            },
            showCurrentValue: {
              ref: "showCurrentValue", label: "Show current value", type: "boolean", defaultValue: true,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            }
          }
        },

        theme: {
          label: "Theme / Colors",
          type: "items",
          items: {
            themeMode: {
              ref: "themeMode", label: "Theme", type: "string", component: "buttongroup", defaultValue: "auto",
              options: [{ value: "auto", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]
            },
            accentColor: {
              ref: "accentColor", label: "Accent color", type: "string", component: "dropdown", defaultValue: "#6366f1",
              options: [
                { value: "#6366f1", label: "\u25CF Indigo" }, { value: "#8b5cf6", label: "\u25CF Violet" },
                { value: "#a855f7", label: "\u25CF Purple" }, { value: "#2563eb", label: "\u25CF Blue" },
                { value: "#0891b2", label: "\u25CF Cyan" }, { value: "#0d9488", label: "\u25CF Teal" },
                { value: "#16a34a", label: "\u25CF Green" }, { value: "#65a30d", label: "\u25CF Lime" },
                { value: "#ca8a04", label: "\u25CF Yellow" }, { value: "#ea580c", label: "\u25CF Orange" },
                { value: "#dc2626", label: "\u25CF Red" }, { value: "#e11d48", label: "\u25CF Rose" },
                { value: "#334155", label: "\u25CF Slate" }, { value: "#0f172a", label: "\u25CF Black" }
              ]
            },
            customAccentColor: { ref: "customAccentColor", label: "Or custom HEX (e.g. #ff6600)", type: "string", defaultValue: "" }
          }
        },

        about: {
          label: "About",
          type: "items",
          items: {
            t1: { label: "BT Variable Input v1.1.0", component: "text", style: "header" },
            t2: { label: "Pro variable input extension for Qlik Sense.", component: "text" },
            t3: { label: "--- CONTROL TYPES ---", component: "text", style: "hint" },
            t4: { label: "Text Input, Number Input, Slider (min/max/step), Dropdown, Button Group, Date Picker.", component: "text" },
            t5: { label: "--- DYNAMIC VALUES ---", component: "text", style: "hint" },
            t6: { label: "Dropdown and Buttons support expressions. Format: Label1~Value1|Label2~Value2", component: "text" },
            t7: { label: "--- LAYOUT ---", component: "text", style: "hint" },
            t8: { label: "Horizontal or Vertical. Groups with headers. Tooltips on hover.", component: "text" },
            t9: { label: "--- THEME ---", component: "text", style: "hint" },
            t10: { label: "Auto / Light / Dark. 14 accent colors + HEX. Colors apply to focus ring, slider, buttons.", component: "text" },
            t11: { label: "--- COMPATIBILITY ---", component: "text", style: "hint" },
            t12: { label: "Qlik Sense Enterprise 2024+, Qlik Cloud, air-gapped. Single file, zero dependencies.", component: "text" },
            t13: { label: "---", component: "text", style: "hint" },
            t14: { label: "Developed by Godja Vasile — github.com/vasile-godja", component: "text" },
            t15: { label: "Provided as-is. No maintenance or support guaranteed.", component: "text", style: "hint" }
          }
        }
      }
    },

    support: { snapshot: false, export: false, exportData: false }
  };
});
