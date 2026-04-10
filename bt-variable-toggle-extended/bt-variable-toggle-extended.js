/**
 * BT Variable Toggle Extended v2.0.0 — Pro Edition
 * Author: Godja Vasile
 *
 * Advanced Qlik Sense extension for toggling variables.
 *
 * FEATURES:
 *  - 3 control styles: Checkbox, Toggle Switch, Button
 *  - Multi-value cycling (define custom values per variable)
 *  - Master toggle (All ON / All OFF)
 *  - Grouped variables with section headers
 *  - Separate ON / OFF colors (15 presets + custom HEX)
 *  - Size slider (14-40px)
 *  - Compact / Normal / Spacious density
 *  - Horizontal / Vertical / Auto-responsive layout
 *  - Expression-driven: label, color, visibility, locked state
 *  - Dependent / cascading variables (radio-group behavior)
 *  - Confirm dialog for critical variables
 *  - Tooltips per variable
 *  - Dark mode (Auto / Light / Dark)
 *  - Keyboard navigation + ARIA accessibility
 *  - About page with disclaimer
 *
 * COMPATIBILITY:
 *  - Qlik Sense Enterprise 2024+
 *  - Qlik Cloud
 *  - Air-gapped / offline environments
 *  - Single-file, no build step, no external dependencies
 *  - Uses only system fonts and jQuery (bundled with Qlik)
 */
define(["jquery", "qlik"], function ($, qlik) {
  "use strict";

  var DENSITY = { compact: 4, normal: 8, spacious: 14 };

  function sizeFromPx(px) {
    px = Math.max(14, Math.min(40, px || 22));
    return {
      box: px,
      radius: Math.round(px * 0.27),
      check: [Math.round(px * 0.23), Math.round(px * 0.41), Math.max(1.5, Math.round(px * 0.09 * 10) / 10)],
      font: Math.max(9, Math.round(px * 0.45)),
      gap: Math.round(px * 0.23),
      sw: Math.round(px * 1.82), swH: px, swDot: px - 4,
      btnPad: Math.round(px * 0.23) + "px " + Math.round(px * 0.64) + "px"
    };
  }

  // ── CSS ──────────────────────────────────────────────────
  var css = [
    // Wrapper
    ".bt-vte-root{width:100%;height:100%;box-sizing:border-box;overflow:auto;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}",
    ".bt-vte-root.dark{background:#1e293b;color:#e2e8f0}",
    ".bt-vte-wrap{display:flex;padding:4px}",
    ".bt-vte-wrap.horizontal{align-items:center;justify-content:center;flex-direction:row;flex-wrap:wrap;gap:4px}",
    ".bt-vte-wrap.vertical{flex-direction:column;justify-content:flex-start}",

    // Table
    ".bt-vte-table{border-collapse:collapse}",
    ".bt-vte-table th{font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#94a3b8;text-align:center;white-space:nowrap}",
    ".bt-vte-table td{text-align:center;vertical-align:middle}",
    ".bt-vte-table td+td{border-left:1px solid #f1f5f9}",
    ".bt-vte-root.dark .bt-vte-table td+td{border-left-color:#334155}",
    ".bt-vte-table th+th{border-left:1px solid #f1f5f9}",
    ".bt-vte-root.dark .bt-vte-table th+th{border-left-color:#334155}",

    // Vertical
    ".bt-vte-vlist{display:flex;flex-direction:column;width:100%}",
    ".bt-vte-vrow{display:flex;align-items:center;gap:10px}",

    // Group header
    ".bt-vte-group{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;padding:8px 8px 4px;border-bottom:1.5px solid #e2e8f0;margin-top:4px}",
    ".bt-vte-group:first-child{margin-top:0}",
    ".bt-vte-root.dark .bt-vte-group{color:#94a3b8;border-bottom-color:#334155}",

    // Item
    ".bt-vte-item{display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;position:relative;outline:none}",
    ".bt-vte-item.locked{opacity:.5;cursor:not-allowed}",
    ".bt-vte-item:focus-visible{outline:2px solid #6366f1;outline-offset:2px;border-radius:4px}",

    // Checkbox
    ".bt-vte-box{border:2px solid #e2e8f0;background:#fff;display:flex;align-items:center;justify-content:center;transition:all .18s cubic-bezier(.4,0,.2,1);flex-shrink:0}",
    ".bt-vte-root.dark .bt-vte-box{border-color:#475569;background:#334155}",
    ".bt-vte-box.checked{box-shadow:0 0 0 3px rgba(99,102,241,.12)}",
    ".bt-vte-chk{display:none;border-style:solid;border-color:#fff;border-top:none;border-left:none;transform:rotate(45deg) translate(-1px,-1px)}",
    ".bt-vte-box.checked .bt-vte-chk{display:block}",

    // Switch
    ".bt-vte-sw{position:relative;border-radius:999px;transition:background .2s;flex-shrink:0;cursor:pointer}",
    ".bt-vte-sw-dot{position:absolute;top:50%;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s;transform:translateY(-50%)}",

    // Button
    ".bt-vte-btn-ctrl{border-radius:6px;font-weight:600;transition:all .18s;flex-shrink:0;white-space:nowrap;border:1.5px solid #e2e8f0;cursor:pointer;text-align:center}",

    // Value + label
    ".bt-vte-val{font-family:'Courier New',monospace;color:#cbd5e1;line-height:1}",
    ".bt-vte-val.on{font-weight:700}",
    ".bt-vte-vlabel{color:#334155;flex:1}",
    ".bt-vte-root.dark .bt-vte-vlabel{color:#e2e8f0}",

    // Master toggle
    ".bt-vte-master{display:flex;gap:8px;padding:6px 10px;margin-bottom:6px;border-bottom:1.5px solid #e2e8f0;align-items:center}",
    ".bt-vte-root.dark .bt-vte-master{border-bottom-color:#334155}",
    ".bt-vte-master-btn{padding:6px 18px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #e2e8f0;background:#fff;color:#475569;transition:all .15s}",
    ".bt-vte-root.dark .bt-vte-master-btn{background:#334155;border-color:#475569;color:#cbd5e1}",
    ".bt-vte-master-btn:hover{border-color:#6366f1;color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}",
    ".bt-vte-master-btn.on-btn:hover{border-color:#16a34a;color:#16a34a}",
    ".bt-vte-master-btn.off-btn:hover{border-color:#dc2626;color:#dc2626}",
    ".bt-vte-master-label{font-size:11px;color:#94a3b8;flex:1;font-weight:600;letter-spacing:.5px;text-transform:uppercase}",

    // Tooltip
    ".bt-vte-tip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1e293b;color:#f1f5f9;padding:5px 10px;border-radius:5px;font-size:10px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s;z-index:10000;max-width:250px;white-space:normal;text-align:center;line-height:1.4}",
    ".bt-vte-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e293b}",
    ".bt-vte-item:hover .bt-vte-tip{opacity:1}",

    // Confirm overlay
    ".bt-vte-confirm{display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(3px);z-index:999999;align-items:center;justify-content:center}",
    ".bt-vte-confirm.open{display:flex}",
    ".bt-vte-confirm-box{background:#fff;border-radius:10px;padding:24px;max-width:380px;width:90%;box-shadow:0 16px 48px rgba(15,23,42,.2);text-align:center;font-family:'Segoe UI',system-ui,sans-serif}",
    ".bt-vte-root.dark .bt-vte-confirm-box{background:#1e293b;border:1px solid #334155}",
    ".bt-vte-confirm-title{font-size:15px;font-weight:700;color:#1e293b;margin-bottom:8px}",
    ".bt-vte-root.dark .bt-vte-confirm-title{color:#f1f5f9}",
    ".bt-vte-confirm-msg{font-size:12px;color:#64748b;margin-bottom:18px;line-height:1.5}",
    ".bt-vte-confirm-btns{display:flex;gap:8px;justify-content:center}",
    ".bt-vte-confirm-yes{padding:7px 24px;border-radius:6px;border:none;background:#6366f1;color:#fff;font-size:13px;font-weight:600;cursor:pointer}",
    ".bt-vte-confirm-yes:hover{background:#4f46e5}",
    ".bt-vte-confirm-no{padding:7px 24px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;color:#64748b;font-size:13px;cursor:pointer}",
    ".bt-vte-confirm-no:hover{background:#f1f5f9}",

    ".bt-vte-empty{padding:12px;font-size:12px;color:#94a3b8}"
  ].join("");

  if (!$("#bt-vte-styles").length) {
    $("<style id='bt-vte-styles'>").html(css).appendTo("head");
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
          resolve(reply && reply.qContent ? reply.qContent.qString : "0");
        });
      } catch (e) { resolve("0"); }
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

  function parseItems(layout) {
    return (layout && layout.cbItems && Array.isArray(layout.cbItems))
      ? layout.cbItems.filter(function (it) { return it && it.varName; }) : [];
  }

  function parseValues(str) {
    if (!str || !str.trim()) return ["0", "1"];
    return str.split(",").map(function (v) { return v.trim(); }).filter(function (v) { return v !== ""; });
  }

  function nextValue(cur, vals) { return vals[(vals.indexOf(cur) + 1) % vals.length]; }

  function isOn(val, vals) {
    if (vals.length <= 2 && vals[0] === "0" && vals[1] === "1") return val === "1";
    return val !== vals[0];
  }

  function resolveExpr(val) {
    // Expression results come as string from Qlik. "1"=true, "0"/""=false
    if (val === undefined || val === null || val === "") return null;
    var s = String(val).trim();
    if (s === "0" || s === "" || s === "-") return false;
    return s;
  }

  function resolveColor(hex) {
    if (!hex || typeof hex !== "string") return null;
    hex = hex.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(hex)) return hex[0] === "#" ? hex : "#" + hex;
    return null;
  }

  // Dark mode detection
  function detectDark(mode) {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    // Auto: check Qlik body classes or prefers-color-scheme
    if ($("body").hasClass("qv-dark") || $("body").hasClass("dark") || $(".qv-panel-sheet").css("background-color") === "rgb(30, 41, 59)") return true;
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
  }

  // ── Build controls ───────────────────────────────────────
  function buildCheckbox(on, s, onC, offC) {
    return '<div class="bt-vte-box' + (on ? " checked" : "") + '" style="width:' + s.box + 'px;height:' + s.box + 'px;border-radius:' + s.radius + 'px;border-color:' + (on ? onC : offC) + ';background:' + (on ? onC : offC) + ';">' +
      '<div class="bt-vte-chk" style="width:' + s.check[0] + 'px;height:' + s.check[1] + 'px;border-width:' + s.check[2] + 'px;"></div></div>';
  }

  function buildSwitch(on, s, onC, offC) {
    return '<div class="bt-vte-sw" style="width:' + s.sw + 'px;height:' + s.swH + 'px;background:' + (on ? onC : offC) + '">' +
      '<div class="bt-vte-sw-dot" style="width:' + s.swDot + 'px;height:' + s.swDot + 'px;left:' + (on ? (s.sw - s.swDot - 2) + "px" : "2px") + '"></div></div>';
  }

  function buildButton(on, s, dv, onC, offC) {
    return '<div class="bt-vte-btn-ctrl" style="padding:' + s.btnPad + ';font-size:' + s.font + 'px;background:' + (on ? onC : offC) + ';color:' + (on ? "#fff" : "#64748b") + ';border-color:' + (on ? onC : offC) + '">' + esc(dv) + '</div>';
  }

  function buildCtrl(style, on, s, dv, onC, offC) {
    if (style === "switch") return buildSwitch(on, s, onC, offC);
    if (style === "button") return buildButton(on, s, dv, onC, offC);
    return buildCheckbox(on, s, onC, offC);
  }

  function updateItemUI($item, newVal, vals, style, s, onC, offC, showVal) {
    var on = isOn(newVal, vals);
    $item.data("val", newVal);
    var $c = $item.find(".bt-vte-box, .bt-vte-sw, .bt-vte-btn-ctrl");
    var $v = $item.find(".bt-vte-val");
    if (style === "checkbox") {
      $c.toggleClass("checked", on).css({ borderColor: on ? onC : offC, background: on ? onC : offC });
    } else if (style === "switch") {
      $c.css("background", on ? onC : offC);
      $c.find(".bt-vte-sw-dot").css("left", on ? (s.sw - s.swDot - 2) + "px" : "2px");
    } else {
      $c.css({ background: on ? onC : offC, color: on ? "#fff" : "#64748b", borderColor: on ? onC : offC }).text(newVal);
    }
    if (showVal) $v.text(newVal).toggleClass("on", on).css("color", on ? onC : "");
  }

  // ── Confirm dialog ───────────────────────────────────────
  function showConfirm(msg, darkMode, onYes, onNo) {
    var $ov = $('<div class="bt-vte-confirm open"><div class="bt-vte-confirm-box">' +
      '<div class="bt-vte-confirm-title">Confirm Action</div>' +
      '<div class="bt-vte-confirm-msg">' + esc(msg) + '</div>' +
      '<div class="bt-vte-confirm-btns">' +
      '<button class="bt-vte-confirm-no">Cancel</button>' +
      '<button class="bt-vte-confirm-yes">Confirm</button>' +
      '</div></div></div>');
    if (darkMode) $ov.find(".bt-vte-confirm-box").css({ background: "#1e293b", border: "1px solid #334155" })
      .find(".bt-vte-confirm-title").css("color", "#f1f5f9");
    $("body").append($ov);
    $ov.find(".bt-vte-confirm-yes").on("click", function () { $ov.remove(); onYes(); });
    $ov.find(".bt-vte-confirm-no").on("click", function () { $ov.remove(); if (onNo) onNo(); });
    $ov.on("click", function (e) { if ($(e.target).is(".bt-vte-confirm")) { $ov.remove(); if (onNo) onNo(); } });
  }

  // ── Extension ────────────────────────────────────────────
  return {
    paint: function ($el, layout) {
      var self = this, app = qlik.currApp(self), enigmaApp = null;
      try { enigmaApp = app.model.enigmaModel; } catch (e) {}

      var items      = parseItems(layout);
      var orient     = layout.orientation || "horizontal";
      var autoLayout = layout.autoLayout === true;
      var boxPx      = layout.boxSize || 22;
      var s          = sizeFromPx(boxPx);
      var ctrlStyle  = layout.ctrlStyle || "checkbox";
      var density    = DENSITY[layout.density || "normal"] || 8;
      var showHeader = layout.showHeader !== false;
      var showValue  = layout.showValue !== false;
      var showMaster = layout.showMaster === true;
      var darkMode   = detectDark(layout.themeMode || "auto");

      var customOn  = (layout.customOnColor || "").trim();
      var customOff = (layout.customOffColor || "").trim();
      var onColor   = resolveColor(customOn) || layout.onColor || "#6366f1";
      var offColor  = resolveColor(customOff) || layout.offColor || "#e2e8f0";

      // Dark mode OFF color adjustment
      if (darkMode && offColor === "#e2e8f0") offColor = "#475569";

      stripBorders($el);

      if (!items.length) {
        $el.html('<div class="bt-vte-root' + (darkMode ? ' dark' : '') + '"><div class="bt-vte-empty">Add variables from the properties panel.</div></div>');
        return;
      }

      // Auto-layout: switch to vertical if not enough horizontal space
      if (autoLayout) {
        var elW = $el.width() || 300;
        var needed = items.length * (s.box + density * 2 + 32);
        if (needed > elW) orient = "vertical";
        else orient = "horizontal";
      }

      // ── Read all variable values + evaluate expressions ──
      Promise.all(items.map(function (it) {
        return getVar(app, it.varName).then(function (v) {
          var vals = parseValues(it.multiValues);

          // Expression-driven properties
          var exprLabel   = resolveExpr(it.exprLabel);
          var exprColor   = resolveColor(resolveExpr(it.exprColor));
          var exprVisible = it.exprVisible !== undefined && it.exprVisible !== "" ? resolveExpr(it.exprVisible) : null;
          var exprLocked  = it.exprLocked !== undefined && it.exprLocked !== "" ? resolveExpr(it.exprLocked) : null;

          var itemLabel  = exprLabel || it.label || it.varName;
          var itemColor  = exprColor || null;
          var itemHidden = exprVisible === false;
          var itemLocked = exprLocked ? true : (it.locked === true);

          return {
            label: itemLabel, varName: it.varName, value: v,
            group: it.group || "", locked: itemLocked, values: vals,
            tooltip: it.tooltip || "", confirmMsg: it.confirmMsg || "",
            dependents: it.dependents || "", itemOnColor: itemColor,
            hidden: itemHidden
          };
        });
      })).then(function (cols) {

        // Filter hidden items
        cols = cols.filter(function (c) { return !c.hidden; });

        if (!cols.length) {
          $el.html('<div class="bt-vte-root' + (darkMode ? ' dark' : '') + '"><div class="bt-vte-empty">All variables are hidden by expressions.</div></div>');
          return;
        }

        var html = '<div class="bt-vte-root' + (darkMode ? ' dark' : '') + '">';

        // Master toggle
        if (showMaster) {
          html += '<div class="bt-vte-master">' +
            '<span class="bt-vte-master-label">Master</span>' +
            '<button class="bt-vte-master-btn on-btn" data-action="all-on">\u2713 All ON</button>' +
            '<button class="bt-vte-master-btn off-btn" data-action="all-off">\u2717 All OFF</button></div>';
        }

        if (orient === "vertical") {
          html += '<div class="bt-vte-wrap vertical">';
          var curGroup = null;
          cols.forEach(function (c, idx) {
            if (c.group && c.group !== curGroup) {
              curGroup = c.group;
              html += '<div class="bt-vte-group">' + esc(c.group) + '</div>';
            }
            var on = isOn(c.value, c.values);
            var dv = c.values.length > 2 ? c.value : (on ? "1" : "0");
            var iOnC = c.itemOnColor || onColor;
            html += '<div class="bt-vte-vrow" style="padding:' + density + 'px 8px">' +
              '<div class="bt-vte-item' + (c.locked ? " locked" : "") + '" tabindex="0" role="checkbox" aria-checked="' + on + '" aria-label="' + esc(c.label) + '"' +
              ' data-var="' + esc(c.varName) + '" data-val="' + esc(String(c.value)) + '" data-values="' + esc(c.values.join(",")) + '"' +
              ' data-locked="' + (c.locked ? "1" : "0") + '" data-confirm="' + esc(c.confirmMsg) + '"' +
              ' data-dependents="' + esc(c.dependents) + '" data-oncolor="' + iOnC + '" style="flex-direction:row;gap:' + s.gap + 'px;">' +
              (c.tooltip ? '<div class="bt-vte-tip">' + esc(c.tooltip) + '</div>' : '') +
              buildCtrl(ctrlStyle, on, s, dv, iOnC, offColor);
            if (showHeader) html += '<span class="bt-vte-vlabel" style="font-size:' + (s.font + 2) + 'px">' + esc(c.label) + '</span>';
            if (showValue) html += '<span class="bt-vte-val' + (on ? " on" : "") + '" style="font-size:' + s.font + 'px;margin-left:auto;' + (on ? "color:" + iOnC : "") + '">' + esc(dv) + '</span>';
            html += '</div></div>';
          });
          html += '</div>';
        } else {
          html += '<div class="bt-vte-wrap horizontal"><table class="bt-vte-table">';
          if (showHeader) {
            html += '<thead><tr>';
            cols.forEach(function (c) {
              html += '<th style="font-size:' + s.font + 'px;padding:0 ' + (density + 8) + 'px ' + density + 'px">' + esc(c.label) + '</th>';
            });
            html += '</tr></thead>';
          }
          html += '<tbody><tr>';
          cols.forEach(function (c) {
            var on = isOn(c.value, c.values);
            var dv = c.values.length > 2 ? c.value : (on ? "1" : "0");
            var iOnC = c.itemOnColor || onColor;
            html += '<td style="padding:' + density + 'px ' + (density + 8) + 'px">' +
              '<div class="bt-vte-item' + (c.locked ? " locked" : "") + '" tabindex="0" role="checkbox" aria-checked="' + on + '" aria-label="' + esc(c.label) + '"' +
              ' data-var="' + esc(c.varName) + '" data-val="' + esc(String(c.value)) + '" data-values="' + esc(c.values.join(",")) + '"' +
              ' data-locked="' + (c.locked ? "1" : "0") + '" data-confirm="' + esc(c.confirmMsg) + '"' +
              ' data-dependents="' + esc(c.dependents) + '" data-oncolor="' + iOnC + '" style="gap:' + s.gap + 'px">' +
              (c.tooltip ? '<div class="bt-vte-tip">' + esc(c.tooltip) + '</div>' : '') +
              buildCtrl(ctrlStyle, on, s, dv, iOnC, offColor);
            if (showValue) html += '<span class="bt-vte-val' + (on ? " on" : "") + '" style="font-size:' + s.font + 'px;' + (on ? "color:" + iOnC : "") + '">' + esc(dv) + '</span>';
            html += '</div></td>';
          });
          html += '</tr></tbody></table></div>';
        }

        html += '</div>';
        $el.html(html);

        // ── Toggle function ──────────────────────────────
        function doToggle($item) {
          if ($item.data("locked") === "1" || $item.data("locked") === 1) return;
          var vName = $item.data("var");
          var curVal = String($item.data("val"));
          var vals = String($item.data("values")).split(",");
          var newVal = nextValue(curVal, vals);
          var iOnC = $item.data("oncolor") || onColor;

          updateItemUI($item, newVal, vals, ctrlStyle, s, iOnC, offColor, showValue);
          setVar(enigmaApp, app, vName, newVal);

          // Dependent variables (radio-group): set others to first value
          var deps = ($item.data("dependents") || "").toString().trim();
          if (deps) {
            deps.split(",").forEach(function (depName) {
              depName = depName.trim();
              if (!depName) return;
              var $dep = $el.find('.bt-vte-item[data-var="' + depName + '"]');
              if ($dep.length) {
                var depVals = String($dep.data("values")).split(",");
                var depOnC = $dep.data("oncolor") || onColor;
                updateItemUI($dep, depVals[0], depVals, ctrlStyle, s, depOnC, offColor, showValue);
              }
              setVar(enigmaApp, app, depName, "0");
            });
          }
        }

        // ── Click handler ────────────────────────────────
        $el.find(".bt-vte-item").off("click keydown").on("click", function () {
          var $item = $(this);
          var confirmMsg = ($item.data("confirm") || "").toString().trim();
          if (confirmMsg) {
            showConfirm(confirmMsg, darkMode, function () { doToggle($item); });
          } else {
            doToggle($item);
          }
        }).on("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            $(this).click();
          }
        });

        // ── Master toggle ────────────────────────────────
        if (showMaster) {
          $el.find(".bt-vte-master-btn").off("click").on("click", function () {
            var action = $(this).data("action");
            $el.find(".bt-vte-item").each(function () {
              var $item = $(this);
              if ($item.data("locked") === "1" || $item.data("locked") === 1) return;
              var vals = String($item.data("values")).split(",");
              var target = action === "all-on" ? vals[vals.length - 1] : vals[0];
              if (String($item.data("val")) !== target) {
                var iOnC = $item.data("oncolor") || onColor;
                updateItemUI($item, target, vals, ctrlStyle, s, iOnC, offColor, showValue);
                setVar(enigmaApp, app, $item.data("var"), target);
              }
            });
          });
        }
      });
    },

    // ── Definition ─────────────────────────────────────────
    definition: {
      type: "items",
      component: "accordion",
      items: {
        variables: {
          label: "Variables",
          type: "items",
          items: {
            cbItems: {
              ref: "cbItems", type: "array", label: "Variables",
              itemTitleRef: "label", allowAdd: true, allowRemove: true, allowMove: true,
              addTranslation: "Add variable",
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
                label: { ref: "label", label: "Custom label", type: "string", defaultValue: "", expression: "optional" },
                group: { ref: "group", label: "Group (e.g. Reload, Filters)", type: "string", defaultValue: "" },
                multiValues: { ref: "multiValues", label: "Multi-values (CSV, e.g. None,Delta,Full)", type: "string", defaultValue: "" },
                tooltip: { ref: "tooltip", label: "Tooltip text", type: "string", defaultValue: "" },
                confirmMsg: { ref: "confirmMsg", label: "Confirm message (leave empty to skip)", type: "string", defaultValue: "" },
                dependents: { ref: "dependents", label: "Dependents — turn OFF on toggle (CSV var names)", type: "string", defaultValue: "" },
                locked: {
                  ref: "locked", label: "Locked (read-only)", type: "boolean", defaultValue: false,
                  component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
                }
              }
            }
          }
        },

        expressions: {
          label: "Expressions",
          type: "items",
          items: {
            exprInfo: { label: "Use Qlik expressions to dynamically control each variable's label, color, visibility, and locked state. Set these per variable in the Variables section above, or use the fields below as global overrides.", component: "text" },
            exprNote: { label: "Per-variable expressions: add expression fields (exprLabel, exprColor, exprVisible, exprLocked) to each variable item in the Variables section. Use expression: optional on label fields for dynamic labels.", component: "text", style: "hint" }
          }
        },

        master: {
          label: "Master Toggle",
          type: "items",
          items: {
            showMaster: {
              ref: "showMaster", label: "Show Master bar (All ON / All OFF)", type: "boolean", defaultValue: false,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            }
          }
        },

        aspect: {
          label: "Appearance",
          type: "items",
          items: {
            ctrlStyle: {
              ref: "ctrlStyle", label: "Control style", type: "string", component: "buttongroup", defaultValue: "checkbox",
              options: [{ value: "checkbox", label: "Checkbox" }, { value: "switch", label: "Switch" }, { value: "button", label: "Button" }]
            },
            orientation: {
              ref: "orientation", label: "Orientation", type: "string", component: "buttongroup", defaultValue: "horizontal",
              options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }]
            },
            autoLayout: {
              ref: "autoLayout", label: "Auto-responsive (override orientation)", type: "boolean", defaultValue: false,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            },
            boxSize: {
              ref: "boxSize", label: "Control size (px)", type: "number", component: "slider",
              defaultValue: 22, min: 14, max: 40, step: 2
            },
            density: {
              ref: "density", label: "Density", type: "string", component: "buttongroup", defaultValue: "normal",
              options: [{ value: "compact", label: "Compact" }, { value: "normal", label: "Normal" }, { value: "spacious", label: "Spacious" }]
            },
            showHeader: {
              ref: "showHeader", label: "Show header", type: "boolean", defaultValue: true,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            },
            showValue: {
              ref: "showValue", label: "Show value", type: "boolean", defaultValue: true,
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
            onColor: {
              ref: "onColor", label: "ON color", type: "string", component: "dropdown", defaultValue: "#6366f1",
              options: [
                { value: "#6366f1", label: "\u25CF Indigo" }, { value: "#8b5cf6", label: "\u25CF Violet" },
                { value: "#a855f7", label: "\u25CF Purple" }, { value: "#2563eb", label: "\u25CF Blue" },
                { value: "#0891b2", label: "\u25CF Cyan" }, { value: "#0d9488", label: "\u25CF Teal" },
                { value: "#16a34a", label: "\u25CF Green" }, { value: "#65a30d", label: "\u25CF Lime" },
                { value: "#ca8a04", label: "\u25CF Yellow" }, { value: "#ea580c", label: "\u25CF Orange" },
                { value: "#dc2626", label: "\u25CF Red" }, { value: "#e11d48", label: "\u25CF Rose" },
                { value: "#db2777", label: "\u25CF Pink" }, { value: "#334155", label: "\u25CF Slate" },
                { value: "#0f172a", label: "\u25CF Black" }
              ]
            },
            customOnColor: { ref: "customOnColor", label: "Or custom ON HEX (e.g. #ff6600)", type: "string", defaultValue: "" },
            offColor: {
              ref: "offColor", label: "OFF color", type: "string", component: "dropdown", defaultValue: "#e2e8f0",
              options: [
                { value: "#e2e8f0", label: "\u25CF Light gray" }, { value: "#cbd5e1", label: "\u25CF Gray" },
                { value: "#94a3b8", label: "\u25CF Dark gray" }, { value: "#ffffff", label: "\u25CF White" },
                { value: "#fecaca", label: "\u25CF Light red" }, { value: "#fed7aa", label: "\u25CF Light orange" },
                { value: "#fef08a", label: "\u25CF Light yellow" }, { value: "#bbf7d0", label: "\u25CF Light green" },
                { value: "#bae6fd", label: "\u25CF Light blue" }, { value: "#e9d5ff", label: "\u25CF Light purple" }
              ]
            },
            customOffColor: { ref: "customOffColor", label: "Or custom OFF HEX", type: "string", defaultValue: "" }
          }
        },

        about: {
          label: "About",
          type: "items",
          items: {
            t1: { label: "BT Variable Toggle Extended v2.0.0 Pro", component: "text", style: "header" },
            t2: { label: "Advanced Qlik Sense extension for toggling variables.", component: "text" },
            t3: { label: "--- CONTROL STYLES ---", component: "text", style: "hint" },
            t4: { label: "Checkbox, Toggle Switch, and Button modes with adjustable size (14-40px slider).", component: "text" },
            t5: { label: "--- LAYOUT ---", component: "text", style: "hint" },
            t6: { label: "Horizontal or Vertical orientation. Auto-responsive mode adapts to container width. Compact, Normal, or Spacious density.", component: "text" },
            t7: { label: "--- MULTI-VALUE ---", component: "text", style: "hint" },
            t8: { label: "Cycle through custom values (e.g. None, Delta, Full) instead of just 0/1.", component: "text" },
            t9: { label: "--- CASCADING / DEPENDENTS ---", component: "text", style: "hint" },
            t10: { label: "Radio-group behavior: toggling one variable automatically turns off others.", component: "text" },
            t11: { label: "--- EXPRESSIONS ---", component: "text", style: "hint" },
            t12: { label: "Dynamic labels, colors, visibility, and locked state driven by Qlik expressions.", component: "text" },
            t13: { label: "--- CONFIRM DIALOG ---", component: "text", style: "hint" },
            t14: { label: "Optional confirmation popup before toggling critical variables.", component: "text" },
            t15: { label: "--- THEME ---", component: "text", style: "hint" },
            t16: { label: "Auto / Light / Dark mode with separate ON and OFF color palettes (15 presets + custom HEX).", component: "text" },
            t17: { label: "--- ACCESSIBILITY ---", component: "text", style: "hint" },
            t18: { label: "Keyboard navigation (Tab/Enter/Space), ARIA roles, tooltips on hover.", component: "text" },
            t19: { label: "--- COMPATIBILITY ---", component: "text", style: "hint" },
            t20: { label: "Qlik Sense Enterprise 2024+, Qlik Cloud, air-gapped/offline environments. Single file, no external dependencies.", component: "text" },
            t21: { label: "---", component: "text", style: "hint" },
            t22: { label: "Developed by Godja Vasile — github.com/vasile-godja/bt-variable-toggle-extended", component: "text" },
            t23: { label: "This extension is provided as-is. The author does not assume responsibility for maintenance, support, or future updates. Use at your own risk.", component: "text", style: "hint" }
          }
        }
      }
    },

    support: { snapshot: false, export: false, exportData: false }
  };
});
