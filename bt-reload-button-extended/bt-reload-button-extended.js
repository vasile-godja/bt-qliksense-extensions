/**
 * BT Reload Button Extended v1.0.0
 * Author: Godja Vasile
 *
 * Pro Qlik Sense reload button with:
 *  - 5 button styles: Filled, Outlined, Gradient, Glass, Minimal
 *  - Multiple variables set before reload (array with dropdown selector)
 *  - Live progress modal with Log/Debug tabs + timer
 *  - Cancel support
 *  - Confirm dialog before reload
 *  - Cooldown timer (prevent accidental double-reload)
 *  - Last reload timestamp badge on button
 *  - Auto-close modal on success
 *  - Button icon animation during reload
 *  - Custom colors, size slider, icon picker
 *  - Dark mode (Auto / Light / Dark)
 *  - Keyboard navigation + ARIA accessibility
 *
 * Single-file, no build step, no external dependencies.
 * Compatible with Qlik Sense Enterprise 2024+ and Qlik Cloud.
 */
define(["jquery", "qlik"], function ($, qlik) {
  "use strict";

  // ── CSS ──────────────────────────────────────────────────
  var css = [
    // Root
    ".bt-rl-root{width:100%;height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:5px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}",

    // Button base
    ".bt-rl-btn{all:unset;box-sizing:border-box;width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:10px;cursor:pointer;transition:all .22s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}",
    ".bt-rl-btn:focus-visible{outline:2px solid #6366f1;outline-offset:2px}",
    ".bt-rl-btn:active{transform:scale(.97)}",
    ".bt-rl-btn.disabled{opacity:.4;cursor:not-allowed;pointer-events:none}",

    // Filled
    ".bt-rl-filled{color:#fff;border:none}",
    ".bt-rl-filled:hover{filter:brightness(1.1);box-shadow:0 4px 16px rgba(0,0,0,.2)}",

    // Outlined
    ".bt-rl-outlined{background:transparent;border:2px solid}",
    ".bt-rl-outlined:hover{box-shadow:0 0 0 3px rgba(99,102,241,.15)}",

    // Gradient
    ".bt-rl-gradient{color:#fff;border:none;background-size:200% 200%;animation:bt-rl-grad 4s ease infinite}",
    "@keyframes bt-rl-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}",
    ".bt-rl-gradient:hover{box-shadow:0 4px 20px rgba(0,0,0,.25);filter:brightness(1.05)}",

    // Glass
    ".bt-rl-glass{background:rgba(255,255,255,.15);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.25);color:#fff}",
    ".bt-rl-glass:hover{background:rgba(255,255,255,.25);box-shadow:0 4px 16px rgba(0,0,0,.15)}",

    // Minimal
    ".bt-rl-minimal{background:transparent;border:1.5px solid #e2e8f0;color:#334155}",
    ".bt-rl-minimal:hover{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12),0 4px 12px rgba(99,102,241,.15)}",
    ".bt-rl-minimal .bt-rl-bg{position:absolute;inset:0;border-radius:10px;opacity:0;transition:opacity .22s;z-index:0}",
    ".bt-rl-minimal:hover .bt-rl-bg{opacity:1}",

    // Dark mode adjustments
    ".bt-rl-root.dark .bt-rl-minimal{border-color:#475569;color:#e2e8f0}",
    // dark bg handled inline",

    // Icon
    ".bt-rl-icon{font-size:18px;position:relative;z-index:1;transition:transform .5s cubic-bezier(.4,0,.2,1);flex-shrink:0}",
    ".bt-rl-btn:hover .bt-rl-icon{transform:rotate(-180deg)}",
    ".bt-rl-icon.spinning{animation:bt-rl-spin 1s linear infinite}",
    "@keyframes bt-rl-spin{100%{transform:rotate(360deg)}}",

    // Text
    ".bt-rl-text{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;line-height:1.25;flex:1}",
    ".bt-rl-label{font-weight:600}",
    ".bt-rl-sub{font-weight:400;opacity:.7}",

    // Badge
    ".bt-rl-badge{position:absolute;z-index:1;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:20px;padding:3px 12px;font-size:10px;font-weight:700;letter-spacing:.8px;pointer-events:none}",
    ".bt-rl-timestamp{position:absolute;z-index:1;bottom:4px;right:8px;font-size:8px;opacity:.5;pointer-events:none}",

    // Cooldown overlay
    ".bt-rl-cooldown{position:absolute;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;border-radius:10px;z-index:5}",
    ".bt-rl-cooldown-text{color:#fff;font-size:20px;font-weight:700;font-family:'Courier New',monospace}",

    // ── Modal ─────────────────────────────────────────
    "#bt-rl-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);z-index:999999}",
    "#bt-rl-modal{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:820px;max-width:96vw;border-radius:12px;box-shadow:0 24px 64px rgba(15,23,42,.18);display:flex;flex-direction:column;overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif}",
    "#bt-rl-modal.light{background:#f8fafc;border:1px solid #e2e8f0}",
    "#bt-rl-modal.dark{background:#1e293b;border:1px solid #334155;color:#e2e8f0}",

    ".bt-rl-m-header{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid #e2e8f0}",
    ".dark .bt-rl-m-header{border-bottom-color:#334155}",
    ".bt-rl-m-header.light{background:#fff}",
    ".bt-rl-m-header.dark{background:#0f172a}",
    ".bt-rl-m-title{color:#64748b;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600}",
    ".bt-rl-m-timer-wrap{display:flex;flex-direction:column;align-items:flex-end}",
    ".bt-rl-m-timer-label{font-size:9px;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase}",
    ".bt-rl-m-timer{font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:3px;line-height:1.2}",

    ".bt-rl-m-tabs{display:flex;gap:2px;padding:6px 16px;border-bottom:1px solid #e2e8f0}",
    ".dark .bt-rl-m-tabs{border-bottom-color:#334155}",
    ".bt-rl-m-tabs.light{background:#f1f5f9}",
    ".bt-rl-m-tabs.dark{background:#0f172a}",
    ".bt-rl-m-tab{padding:4px 14px;font-size:11px;border-radius:4px;cursor:pointer;border:1px solid transparent;color:#94a3b8;background:transparent;transition:all .15s}",
    ".bt-rl-m-tab.active{border-color:#e2e8f0;color:#334155;font-weight:600}",
    ".bt-rl-m-tab.active.light{background:#fff}",
    ".bt-rl-m-tab.active.dark{background:#1e293b;border-color:#475569;color:#e2e8f0}",

    ".bt-rl-m-log-wrap{height:400px;overflow-y:auto;padding:12px 16px;scroll-behavior:smooth}",
    ".bt-rl-m-log-wrap.light{background:#f8fafc}",
    ".bt-rl-m-log-wrap.dark{background:#0f172a}",
    ".bt-rl-m-log{font-family:'Cascadia Code','Fira Code','Courier New',monospace;font-size:12px;line-height:1.8}",
    ".bt-rl-m-line{display:flex;word-break:break-all;padding:0 0 1px}",
    ".bt-rl-m-ts{color:#cbd5e1;white-space:nowrap;user-select:none;margin-right:10px;flex-shrink:0}",
    ".bt-rl-m-line.info .bt-rl-m-msg{color:#475569}",
    ".dark .bt-rl-m-line.info .bt-rl-m-msg{color:#94a3b8}",
    ".bt-rl-m-line.success .bt-rl-m-msg{color:#16a34a;font-weight:600}",
    ".bt-rl-m-line.warn .bt-rl-m-msg{color:#d97706}",
    ".bt-rl-m-line.error .bt-rl-m-msg{color:#dc2626;font-weight:600}",
    ".bt-rl-m-line.trace .bt-rl-m-msg{color:#2563eb}",
    ".bt-rl-m-line.debug .bt-rl-m-msg{color:#cbd5e1;font-size:11px}",

    ".bt-rl-m-footer{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid #e2e8f0;gap:8px}",
    ".dark .bt-rl-m-footer{border-top-color:#334155}",
    ".bt-rl-m-footer.light{background:#fff}",
    ".bt-rl-m-footer.dark{background:#0f172a}",
    ".bt-rl-m-status{font-size:12px;color:#64748b;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".bt-rl-m-status.success{color:#16a34a;font-weight:600}",
    ".bt-rl-m-status.error{color:#dc2626;font-weight:600}",
    ".bt-rl-m-status.warn{color:#d97706;font-weight:600}",

    ".bt-rl-m-btn{padding:6px 22px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;border:1px solid #e2e8f0}",
    ".bt-rl-m-start{background:#6366f1;color:#fff;border-color:#4f46e5}",
    ".bt-rl-m-start:hover{background:#4f46e5}",
    ".bt-rl-m-cancel{display:none;background:#fff7ed;color:#c2410c;border-color:#fed7aa}",
    ".bt-rl-m-cancel:hover{background:#dc2626;color:#fff;border-color:#dc2626}",
    ".bt-rl-m-close{background:#f1f5f9;color:#475569}",
    ".bt-rl-m-close:not(:disabled):hover{background:#dc2626;color:#fff;border-color:#dc2626}",
    ".bt-rl-m-btn:disabled{opacity:.35;cursor:not-allowed}",

    ".bt-rl-m-log-wrap::-webkit-scrollbar{width:4px}",
    ".bt-rl-m-log-wrap::-webkit-scrollbar-track{background:transparent}",
    ".bt-rl-m-log-wrap::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}",

    // Confirm
    ".bt-rl-confirm{display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(3px);z-index:999999;align-items:center;justify-content:center}",
    ".bt-rl-confirm.open{display:flex}",
    ".bt-rl-confirm-box{background:#fff;border-radius:10px;padding:24px;max-width:380px;width:90%;box-shadow:0 16px 48px rgba(15,23,42,.2);text-align:center}",
    ".bt-rl-confirm-title{font-size:15px;font-weight:700;color:#1e293b;margin-bottom:8px}",
    ".bt-rl-confirm-msg{font-size:12px;color:#64748b;margin-bottom:18px;line-height:1.5}",
    ".bt-rl-confirm-btns{display:flex;gap:8px;justify-content:center}",
    ".bt-rl-confirm-yes{padding:7px 24px;border-radius:6px;border:none;background:#6366f1;color:#fff;font-size:13px;font-weight:600;cursor:pointer}",
    ".bt-rl-confirm-no{padding:7px 24px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;color:#64748b;font-size:13px;cursor:pointer}"
  ].join("");

  if (!$("#bt-rl-styles").length) {
    $("<style id='bt-rl-styles'>").html(css).appendTo("head");
  }

  // ── Helpers ──────────────────────────────────────────────
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function esc(t) { return $("<div>").text(t).html(); }
  function ts() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); }

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

  function stripBorders($el) {
    var $n = $el;
    for (var i = 0; i < 5; i++) {
      $n.css({ background: "transparent", border: "none", boxShadow: "none", outline: "none" });
      $n = $n.parent();
      if (!$n.length || $n.is("body")) break;
    }
  }

  function setVar(enigmaApp, app, name, value) {
    if (!name) return Promise.resolve();
    if (enigmaApp) {
      return enigmaApp.getVariableByName(name)
        .then(function (v) { return v.setStringValue(String(value || "")); })
        .catch(function () { try { app.variable.setStringValue(name, String(value || "")); } catch (e) {} });
    }
    try { app.variable.setStringValue(name, String(value || "")); } catch (e) {}
    return Promise.resolve();
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

  // ── Icons ────────────────────────────────────────────────
  var ICONS = {
    reload: "\u21BB", play: "\u25B6", lightning: "\u26A1",
    rocket: "\uD83D\uDE80", gear: "\u2699", download: "\u2B07",
    sync: "\u27F3", check: "\u2713"
  };

  // Last reload timestamp (per app, persisted in memory)
  var lastReloadTs = {};

  // ── Modal ────────────────────────────────────────────────
  function openModal(app, enigmaApp, varItems, layout, darkMode, accentColor, onComplete) {
    $("#bt-rl-overlay").remove();
    var theme = darkMode ? "dark" : "light";

    var overlay = $(
      '<div id="bt-rl-overlay">' +
        '<div id="bt-rl-modal" class="' + theme + '">' +
          '<div class="bt-rl-m-header ' + theme + '">' +
            '<span class="bt-rl-m-title">\u25B6\u00A0 Reload \u2014 Progress Log</span>' +
            '<div class="bt-rl-m-timer-wrap">' +
              '<span class="bt-rl-m-timer-label">ELAPSED</span>' +
              '<span class="bt-rl-m-timer" style="color:' + accentColor + '">00:00</span>' +
            '</div>' +
          '</div>' +
          '<div class="bt-rl-m-tabs ' + theme + '">' +
            '<button class="bt-rl-m-tab active ' + theme + '" data-tab="log">Log</button>' +
            '<button class="bt-rl-m-tab ' + theme + '" data-tab="debug">Debug</button>' +
          '</div>' +
          '<div class="bt-rl-m-log-wrap ' + theme + '"><div class="bt-rl-m-log"></div></div>' +
          '<div class="bt-rl-m-footer ' + theme + '">' +
            '<span class="bt-rl-m-status">Press Start to begin reload...</span>' +
            '<button class="bt-rl-m-btn bt-rl-m-start" style="background:' + accentColor + '">\u25B6\u00A0 Start</button>' +
            '<button class="bt-rl-m-btn bt-rl-m-cancel">\u25A0\u00A0 Cancel</button>' +
            '<button class="bt-rl-m-btn bt-rl-m-download" style="display:none;background:#f1f5f9;color:#475569">\u2B07 Log</button>' +
            '<button class="bt-rl-m-btn bt-rl-m-close">\u2715\u00A0 Close</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    $("body").append(overlay);
    overlay.fadeIn(200);

    var currentTab = "log", logLines = [];
    var $logEl = overlay.find(".bt-rl-m-log"), $logWrap = overlay.find(".bt-rl-m-log-wrap");
    var $timerEl = overlay.find(".bt-rl-m-timer"), $statusEl = overlay.find(".bt-rl-m-status");
    var $startBtn = overlay.find(".bt-rl-m-start"), $cancelBtn = overlay.find(".bt-rl-m-cancel"), $closeBtn = overlay.find(".bt-rl-m-close");
    var $downloadBtn = overlay.find(".bt-rl-m-download");
    var timerIv = null, reloadDone = false, pollIv = null, doReloadRequestId = null, globalObj = null;

    // Download log as .txt file
    function downloadLog() {
      var text = "BT Reload Button — Log Export\n";
      text += "Date: " + new Date().toISOString() + "\n";
      text += "Timer: " + overlay.find(".bt-rl-m-timer").text() + "\n";
      text += "Status: " + $statusEl.text() + "\n";
      text += "=".repeat(60) + "\n\n";
      text += "=== LOG ===\n";
      logLines.forEach(function (l) {
        if (l.tab === "log") {
          var m = l.html.match(/\[([^\]]+)\].*<span class="bt-rl-m-msg">([^<]*)<\/span>/);
          if (m) text += "[" + m[1] + "] " + m[2] + "\n";
        }
      });
      text += "\n=== DEBUG ===\n";
      logLines.forEach(function (l) {
        if (l.tab === "debug") {
          var m = l.html.match(/\[([^\]]+)\].*<span class="bt-rl-m-msg">([^<]*)<\/span>/);
          if (m) text += "[" + m[1] + "] " + m[2] + "\n";
        }
      });
      var blob = new Blob([text], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "reload-log-" + new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19) + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    $downloadBtn.on("click", function (e) { e.stopPropagation(); downloadLog(); });

    // Tabs
    overlay.on("click", ".bt-rl-m-tab", function () {
      currentTab = $(this).data("tab");
      overlay.find(".bt-rl-m-tab").removeClass("active");
      $(this).addClass("active");
      var html = "";
      logLines.forEach(function (l) { if (currentTab === "debug" || l.tab === "log") html += l.html; });
      $logEl.html(html);
      $logWrap[0].scrollTop = $logWrap[0].scrollHeight;
    });

    function appendLine(text, cls, tab) {
      text = (text || "").trim();
      if (!text) return;
      var html = '<div class="bt-rl-m-line ' + (cls || "info") + '"><span class="bt-rl-m-ts">[' + ts() + ']</span><span class="bt-rl-m-msg">' + esc(text) + '</span></div>';
      logLines.push({ html: html, tab: tab || "log" });
      if (currentTab === "debug" || (tab || "log") === "log") {
        $logEl.append(html);
        $logWrap[0].scrollTop = $logWrap[0].scrollHeight;
      }
    }
    function log(t, c) { appendLine(t, c, "log"); }
    function debug(t) { appendLine(t, "debug", "debug"); }

    var seenP = {}, lastScriptError = "";
    function logPersistent(t) {
      t = (t || "").trim();
      if (!t || seenP[t]) return;
      seenP[t] = true;
      var low = t.toLowerCase();
      var cls;
      if (low.indexOf("error") > -1 || low.indexOf("not found") > -1 || low.indexOf("not loaded") > -1 ||
          low.indexOf("failed") > -1 || low.indexOf("please correct") > -1 || low.indexOf("has not been") > -1) {
        cls = "error";
        lastScriptError = t;
      } else if (low.indexOf("warning") > -1) {
        cls = "warn";
      } else {
        cls = "trace";
      }
      log(t, cls);
    }

    function processProgress(p) {
      if (!p) return;
      if (p.qPersistentProgress) p.qPersistentProgress.split(/\r?\n/).forEach(logPersistent);
      if (p.qTransientProgress && p.qTransientProgress.trim()) $statusEl.text(p.qTransientProgress.trim());
    }

    function closeModal() { overlay.fadeOut(200, function () { overlay.remove(); }); }

    function cleanup() {
      reloadDone = true;
      if (pollIv) clearInterval(pollIv);
      if (timerIv) clearInterval(timerIv);
      $cancelBtn.hide();
      $downloadBtn.show();
      $closeBtn.prop("disabled", false).off("click").on("click", closeModal);
    }

    $closeBtn.on("click", closeModal);
    overlay.on("click", function (e) { if ($(e.target).is("#bt-rl-overlay") && !$closeBtn.prop("disabled")) closeModal(); });

    // Start
    $startBtn.on("click", function () {
      $startBtn.prop("disabled", true);
      $closeBtn.prop("disabled", true).off("click");
      $cancelBtn.show().prop("disabled", false);

      var startTime = Date.now();
      timerIv = setInterval(function () {
        var ms = Date.now() - startTime;
        $timerEl.text(pad(Math.floor(ms / 60000)) + ":" + pad(Math.floor((ms % 60000) / 1000)));
      }, 500);

      // Traffic listeners
      function onSent(raw) {
        try {
          var d = typeof raw === "string" ? JSON.parse(raw) : raw;
          debug("SENT: method=" + (d.method || "-") + " id=" + d.id);
          if (d.method === "DoReload" || d.method === "DoReloadEx") { doReloadRequestId = d.id; debug(">>> DoReload ID: " + doReloadRequestId); }
        } catch (e) {}
      }
      function onTraffic(raw) {
        try {
          var d = typeof raw === "string" ? JSON.parse(raw) : raw;

          // Log ALL received messages in debug (full content)
          var dbgMsg = "RECV: ";
          if (d.id) dbgMsg += "id=" + d.id + " ";
          if (d.method) dbgMsg += "method=" + d.method + " ";
          if (d.error) dbgMsg += "ERROR=" + JSON.stringify(d.error) + " ";
          if (d.result !== undefined) {
            var rStr = JSON.stringify(d.result);
            if (rStr.length > 5) dbgMsg += "result=" + rStr;
          }
          if (dbgMsg.length > 10) debug(dbgMsg);

          // OnProgress events
          if (d.method === "OnProgress") {
            var p = Array.isArray(d.params) && d.params[0] ? (d.params[0].qProgressData || d.params[0]) : (d.params ? (d.params.qProgressData || d.params) : null);
            if (p) processProgress(p);
          }

          // Capture errors from any response
          if (d.error) {
            var errMsg = d.error.message || d.error.qErrorString || JSON.stringify(d.error);
            log("Engine error: " + errMsg, "error");
            lastScriptError = lastScriptError || errMsg;
          }

          // Capture DoReload response — if result contains error info
          if (d.id && d.id === doReloadRequestId && d.result !== undefined) {
            debug("DoReload response: " + JSON.stringify(d.result).substring(0, 300));
            if (d.result && d.result.qSuccess === false) {
              var reloadErr = d.result.qScriptLogFile || d.result.qErrorString || "Reload returned false";
              log("Reload error: " + reloadErr, "error");
              lastScriptError = lastScriptError || reloadErr;
            }
          }

          // Capture progress data — handle both direct and JSON-patch format
          if (d.result && typeof d.result === "object") {
            // Direct format
            if (d.result.qPersistentProgress || d.result.qTransientProgress) {
              processProgress(d.result);
            }
            if (d.result.qProgressData) {
              // qProgressData can be direct object or JSON-patch array
              var pd = d.result.qProgressData;
              if (Array.isArray(pd)) {
                // JSON-patch format: [{op:"add",path:"/",value:{...}}] or [{op:"replace",path:"/qPersistentProgress",value:"..."}]
                var assembled = {};
                pd.forEach(function (patch) {
                  if (patch.op === "add" && patch.path === "/" && patch.value) {
                    assembled = patch.value;
                  } else if (patch.op === "replace" && patch.value !== undefined) {
                    var key = patch.path.replace("/", "");
                    assembled[key] = patch.value;
                  }
                });
                if (assembled.qPersistentProgress || assembled.qTransientProgress || assembled.qErrorData) {
                  processProgress(assembled);
                }
                // Process qErrorData
                if (assembled.qErrorData && Array.isArray(assembled.qErrorData) && assembled.qErrorData.length) {
                  assembled.qErrorData.forEach(function (err) {
                    var errText = err.qErrorString || err.qLine || JSON.stringify(err);
                    log("Script error: " + errText, "error");
                    lastScriptError = lastScriptError || errText;
                  });
                }
              } else {
                processProgress(pd);
              }
            }
            // Also check qReturn for JSON-patch format (Qlik Cloud uses this)
            if (d.result.qReturn && Array.isArray(d.result.qReturn)) {
              d.result.qReturn.forEach(function (patch) {
                if (patch.op === "add" && patch.value && typeof patch.value === "object") {
                  if (patch.value.qPersistentProgress) processProgress(patch.value);
                  if (patch.value.qErrorData && Array.isArray(patch.value.qErrorData)) {
                    patch.value.qErrorData.forEach(function (err) {
                      var errText = err.qErrorString || err.qLine || JSON.stringify(err);
                      log("Script error: " + errText, "error");
                      lastScriptError = lastScriptError || errText;
                    });
                  }
                }
              });
            }
          }
        } catch (e) {}
      }

      try { enigmaApp.session.on("traffic:sent", onSent); debug("traffic:sent OK"); } catch (e) { debug("traffic:sent FAIL"); }
      try { enigmaApp.session.on("traffic:received", onTraffic); debug("traffic:received OK"); } catch (e) { debug("traffic:received FAIL"); }

      enigmaApp.session.open().then(function (g) {
        globalObj = g; debug("Global OK");
        pollIv = setInterval(function () {
          if (reloadDone || !doReloadRequestId) return;
          globalObj.getProgress(doReloadRequestId).then(function (r) {
            if (r) processProgress(r.qProgressData || r);
          }).catch(function () {});
        }, 800);
      }).catch(function (e) { debug("session.open FAIL: " + e.message); });

      // Cancel
      $cancelBtn.off("click").on("click", function () {
        $cancelBtn.prop("disabled", true).text("Cancelling...");
        log("Cancel requested...", "warn");
        if (globalObj && typeof globalObj.cancelReload === "function") {
          globalObj.cancelReload().catch(function () {
            enigmaApp.session.send({ method: "CancelReload", handle: -1, params: {} }).catch(function () {});
          });
        } else {
          enigmaApp.session.send({ method: "CancelReload", handle: -1, params: {} }).catch(function () {});
        }
      });

      function finish(ok, cancelled) {
        // Final progress fetch
        var fp = (globalObj && doReloadRequestId) ? globalObj.getProgress(doReloadRequestId).catch(function () { return null; }) : Promise.resolve(null);
        fp.then(function (r) {
          if (r) processProgress(r.qProgressData || r);
          try { enigmaApp.session.removeListener("traffic:sent", onSent); } catch (e) {}
          try { enigmaApp.session.removeListener("traffic:received", onTraffic); } catch (e) {}
          cleanup();

          if (cancelled) {
            log("Reload cancelled.", "warn"); $statusEl.text("Cancelled").addClass("warn");
            if (onComplete) onComplete(false);
          } else if (ok) {
            log("Reload completed successfully.", "success"); $statusEl.text("Completed").addClass("success");
            enigmaApp.doSave().catch(function () {});
            lastReloadTs[app.id || "default"] = new Date();
            if (onComplete) onComplete(true);
            if (layout.autoClose) setTimeout(closeModal, 1500);
          } else {
            // Reload failed — try to get the script log from engine
            var getLogPromise = enigmaApp.getScript
              ? enigmaApp.getScript().catch(function () { return ""; })
              : Promise.resolve("");

            getLogPromise.then(function (script) {
              // Try checkScriptSyntax for error location
              return enigmaApp.checkScriptSyntax().then(function (errs) {
                if (errs && errs.length) {
                  errs.forEach(function (e) {
                    var lines = (script || "").split("\n");
                    var errLine = (e.qTextPos !== undefined && lines.length > 0) ? " near: " + (lines[e.qTextPos] || "").trim().substring(0, 80) : "";
                    var errText = "Script error in tab " + (e.qTabIx || 0) + errLine;
                    log(errText, "error");
                    if (!lastScriptError) lastScriptError = errText;
                  });
                }
              }).catch(function () {});
            }).then(function () {
              var failMsg = lastScriptError ? "Failed: " + lastScriptError : "Reload failed — download log for details";
              log(failMsg, "error");
              $statusEl.text(failMsg).addClass("error");
              if (onComplete) onComplete(false);
            });
          }
        });
      }

      // Pipeline: set variables → save → reload
      var chain = Promise.resolve();

      if (varItems && varItems.length) {
        $statusEl.text("Setting variables...");
        varItems.forEach(function (vi) {
          chain = chain.then(function () {
            if (!vi.varName) return;
            debug("Setting " + vi.varName + " = " + (vi.varValue || ""));
            return setVar(enigmaApp, app, vi.varName, vi.varValue).then(function () {
              log("Set [" + vi.varName + "] = '" + esc(vi.varValue || "") + "' OK", "info");
            });
          });
        });
      }

      chain.then(function () {
        log("Saving...", "info"); $statusEl.text("Saving...");
        return enigmaApp.doSave().catch(function (e) { debug("doSave warn: " + e.message); });
      }).then(function () {
        log("Reload started...", "info"); $statusEl.text("Running...");
        return enigmaApp.doReload(0, false, false);
      }).then(function (ok) {
        finish(ok, $cancelBtn.prop("disabled") && !ok);
      }).catch(function (err) {
        var msg = err && err.message ? err.message : String(err);
        var wasCancelled = msg.indexOf("cancel") > -1 || msg.indexOf("abort") > -1 || msg.indexOf("11001") > -1;
        cleanup();
        if (wasCancelled) { log("Reload cancelled.", "warn"); $statusEl.text("Cancelled").addClass("warn"); }
        else { log("ERROR: " + msg, "error"); $statusEl.text("Error: " + msg).addClass("error"); }
        if (onComplete) onComplete(false);
      });
    });
  }

  // ── Confirm dialog ───────────────────────────────────────
  function showConfirm(msg, darkMode, onYes) {
    var $ov = $('<div class="bt-rl-confirm open"><div class="bt-rl-confirm-box">' +
      '<div class="bt-rl-confirm-title">\u26A0 Confirm Reload</div>' +
      '<div class="bt-rl-confirm-msg">' + esc(msg) + '</div>' +
      '<div class="bt-rl-confirm-btns"><button class="bt-rl-confirm-no">Cancel</button><button class="bt-rl-confirm-yes">Reload</button></div>' +
      '</div></div>');
    if (darkMode) $ov.find(".bt-rl-confirm-box").css({ background: "#1e293b", border: "1px solid #334155" }).find(".bt-rl-confirm-title").css("color", "#f1f5f9");
    $("body").append($ov);
    $ov.find(".bt-rl-confirm-yes").on("click", function () { $ov.remove(); onYes(); });
    $ov.find(".bt-rl-confirm-no").on("click", function () { $ov.remove(); });
    $ov.on("click", function (e) { if ($(e.target).is(".bt-rl-confirm")) $ov.remove(); });
  }

  // ── Extension ────────────────────────────────────────────
  return {
    paint: function ($el, layout) {
      var self = this, app = qlik.currApp(self), enigmaApp = null;
      try { enigmaApp = app.model.enigmaModel; } catch (e) {}

      var btnStyle   = layout.btnStyle || "minimal";
      var label      = layout.btnLabel || "Reload";
      var sub        = layout.subLabel || "";
      var icon       = ICONS[layout.iconType || "reload"] || ICONS.reload;
      var badge      = layout.badgeText || "LIVE";
      var showBadge  = layout.showBadge !== false;
      var fontSize   = layout.fontSize || 13;
      var darkMode   = detectDark(layout.themeMode || "auto");
      var confirmMsg = layout.confirmMsg || "";
      var cooldown   = layout.cooldownSec || 0;
      var autoClose  = layout.autoClose === true;
      var showTs     = layout.showTimestamp === true;

      var customColor = resolveColor(layout.customAccentColor);
      var accentColor = customColor || layout.accentColor || "#6366f1";
      var customText  = resolveColor(layout.customTextColor);
      var textColor   = customText || layout.textColor || "";

      var varItems = (layout.varItems && Array.isArray(layout.varItems))
        ? layout.varItems.filter(function (v) { return v && v.varName; }) : [];

      stripBorders($el);

      // Build button style + text color
      var btnClass = "bt-rl-btn bt-rl-" + btnStyle;
      var btnInline = "";
      var autoText = textColor || "#fff"; // default text for solid backgrounds
      if (btnStyle === "filled") {
        btnInline = "background:" + accentColor + ";color:" + autoText + ";";
      } else if (btnStyle === "outlined") {
        btnInline = "border-color:" + accentColor + ";color:" + (textColor || accentColor) + ";";
      } else if (btnStyle === "gradient") {
        btnInline = "background:linear-gradient(135deg," + accentColor + ",#a855f7,#ec4899," + accentColor + ");color:" + autoText + ";";
      } else if (btnStyle === "glass") {
        // Convert accentColor hex to rgba for glass transparency
        var gh = accentColor.replace("#", "");
        if (gh.length === 3) gh = gh[0]+gh[0]+gh[1]+gh[1]+gh[2]+gh[2];
        var gr = parseInt(gh.substring(0,2),16), gg = parseInt(gh.substring(2,4),16), gb = parseInt(gh.substring(4,6),16);
        btnInline = "background:rgba(" + gr + "," + gg + "," + gb + ",.2);border-color:rgba(" + gr + "," + gg + "," + gb + ",.35);color:" + (textColor || accentColor) + ";";
      } else if (textColor) {
        btnInline = "color:" + textColor + ";";
      }

      // Badge colors
      var badgeStyle = (btnStyle === "minimal" || btnStyle === "outlined")
        ? "background:#eef2ff;border:1.5px solid #c7d2fe;color:" + accentColor + ";"
        : "background:rgba(255,255,255,.25);color:" + autoText + ";";

      // Timestamp
      var tsHtml = "";
      if (showTs) {
        var lastTs = lastReloadTs[app.id || "default"];
        if (lastTs) {
          tsHtml = '<span class="bt-rl-timestamp">' + pad(lastTs.getHours()) + ':' + pad(lastTs.getMinutes()) + '</span>';
        }
      }

      // Hover background for minimal style — uses accent color at low opacity
      var bgHtml = "";
      if (btnStyle === "minimal") {
        var bgColor = darkMode
          ? "linear-gradient(135deg,rgba(30,41,59,.8),rgba(51,65,85,.8))"
          : "linear-gradient(135deg," + accentColor + "10," + accentColor + "18)";
        bgHtml = '<div class="bt-rl-bg" style="background:' + bgColor + '"></div>';
      }

      $el.html(
        '<div class="bt-rl-root' + (darkMode ? ' dark' : '') + '">' +
          '<button class="' + btnClass + '" style="' + btnInline + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
            bgHtml +
            '<span class="bt-rl-icon" style="font-size:' + Math.round(fontSize * 1.4) + 'px">' + icon + '</span>' +
            '<span class="bt-rl-text">' +
              '<span class="bt-rl-label" style="font-size:' + fontSize + 'px">' + esc(label) + '</span>' +
              (sub ? '<span class="bt-rl-sub" style="font-size:' + Math.round(fontSize * 0.77) + 'px">' + esc(sub) + '</span>' : '') +
            '</span>' +
            (showBadge ? '<span class="bt-rl-badge" style="' + badgeStyle + '">' + esc(badge) + '</span>' : '') +
            tsHtml +
          '</button>' +
        '</div>'
      );

      var $btn = $el.find(".bt-rl-btn");
      var $icon = $el.find(".bt-rl-icon");

      // Cooldown state
      var coolingDown = false;

      $btn.off("click keydown").on("click", function () {
        if (coolingDown) return;
        if (!enigmaApp) { alert("Cannot access Qlik Engine."); return; }

        function doReload() {
          // Spin icon
          $icon.addClass("spinning");

          // Cooldown
          if (cooldown > 0) {
            coolingDown = true;
            var $cd = $('<div class="bt-rl-cooldown"><span class="bt-rl-cooldown-text">' + cooldown + '</span></div>');

            var startCooldown = function () {
              $btn.addClass("disabled").append($cd);
              var remain = cooldown;
              var cdIv = setInterval(function () {
                remain--;
                if (remain <= 0) { clearInterval(cdIv); $cd.remove(); $btn.removeClass("disabled"); coolingDown = false; }
                else { $cd.find(".bt-rl-cooldown-text").text(remain); }
              }, 1000);
            };

            openModal(app, enigmaApp, varItems, layout, darkMode, accentColor, function () {
              $icon.removeClass("spinning");
              startCooldown();
            });
          } else {
            openModal(app, enigmaApp, varItems, layout, darkMode, accentColor, function () {
              $icon.removeClass("spinning");
            });
          }
        }

        if (confirmMsg) {
          showConfirm(confirmMsg, darkMode, doReload);
        } else {
          doReload();
        }
      }).on("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $(this).click(); }
      });
    },

    definition: {
      type: "items",
      component: "accordion",
      items: {
        variables: {
          label: "Variables",
          type: "items",
          items: {
            varItems: {
              ref: "varItems", type: "array", label: "Set variables before reload",
              itemTitleRef: "varName", allowAdd: true, allowRemove: true, allowMove: true,
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
                varValue: { ref: "varValue", label: "Value to set", type: "string", defaultValue: "", expression: "optional" }
              }
            }
          }
        },

        behavior: {
          label: "Behavior",
          type: "items",
          items: {
            confirmMsg: { ref: "confirmMsg", label: "Confirm message (leave empty to skip)", type: "string", defaultValue: "" },
            cooldownSec: {
              ref: "cooldownSec", label: "Cooldown after reload (seconds)", type: "number",
              component: "slider", defaultValue: 0, min: 0, max: 30, step: 1
            },
            autoClose: {
              ref: "autoClose", label: "Auto-close modal on success", type: "boolean", defaultValue: false,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            }
          }
        },

        appearance: {
          label: "Appearance",
          type: "items",
          items: {
            btnStyle: {
              ref: "btnStyle", label: "Button style", type: "string", component: "dropdown", defaultValue: "minimal",
              options: [
                { value: "minimal", label: "Minimal (outlined subtle)" },
                { value: "filled", label: "Filled (solid color)" },
                { value: "outlined", label: "Outlined (bold border)" },
                { value: "gradient", label: "Gradient (animated)" },
                { value: "glass", label: "Glass (frosted blur)" }
              ]
            },
            iconType: {
              ref: "iconType", label: "Icon", type: "string", component: "dropdown", defaultValue: "reload",
              options: [
                { value: "reload", label: "\u21BB Reload" },
                { value: "sync", label: "\u27F3 Sync" },
                { value: "play", label: "\u25B6 Play" },
                { value: "lightning", label: "\u26A1 Lightning" },
                { value: "gear", label: "\u2699 Gear" },
                { value: "download", label: "\u2B07 Download" },
                { value: "rocket", label: "\uD83D\uDE80 Rocket" }
              ]
            },
            btnLabel: { ref: "btnLabel", label: "Button label", type: "string", defaultValue: "Reload" },
            subLabel: { ref: "subLabel", label: "Subtitle", type: "string", defaultValue: "" },
            fontSize: {
              ref: "fontSize", label: "Font size (px)", type: "number", component: "slider",
              defaultValue: 13, min: 10, max: 22, step: 1
            },
            showBadge: {
              ref: "showBadge", label: "Show badge", type: "boolean", defaultValue: true,
              component: "switch", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }]
            },
            badgeText: { ref: "badgeText", label: "Badge text", type: "string", defaultValue: "LIVE" },
            showTimestamp: {
              ref: "showTimestamp", label: "Show last reload time on button", type: "boolean", defaultValue: false,
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
            customAccentColor: { ref: "customAccentColor", label: "Or custom accent HEX (e.g. #ff6600)", type: "string", defaultValue: "" },
            textColor: {
              ref: "textColor", label: "Text / icon color", type: "string", component: "dropdown", defaultValue: "",
              options: [
                { value: "", label: "Auto (white on solid, accent on outlined)" },
                { value: "#ffffff", label: "\u25CF White" },
                { value: "#f1f5f9", label: "\u25CF Off-white" },
                { value: "#1e293b", label: "\u25CF Dark" },
                { value: "#334155", label: "\u25CF Slate" },
                { value: "#0f172a", label: "\u25CF Black" },
                { value: "#6366f1", label: "\u25CF Indigo" },
                { value: "#2563eb", label: "\u25CF Blue" },
                { value: "#16a34a", label: "\u25CF Green" },
                { value: "#dc2626", label: "\u25CF Red" },
                { value: "#ca8a04", label: "\u25CF Yellow" }
              ]
            },
            customTextColor: { ref: "customTextColor", label: "Or custom text HEX", type: "string", defaultValue: "" }
          }
        },

        about: {
          label: "About",
          type: "items",
          items: {
            t1: { label: "BT Reload Button Extended v1.0.0", component: "text", style: "header" },
            t2: { label: "Pro reload button for Qlik Sense.", component: "text" },
            t3: { label: "--- BUTTON STYLES ---", component: "text", style: "hint" },
            t4: { label: "Minimal, Filled, Outlined, Gradient (animated), Glass (frosted). Custom accent color with 14 presets + HEX.", component: "text" },
            t5: { label: "--- VARIABLES ---", component: "text", style: "hint" },
            t6: { label: "Set multiple variables before reload using dropdown selector. Supports expressions as values.", component: "text" },
            t7: { label: "--- BEHAVIOR ---", component: "text", style: "hint" },
            t8: { label: "Confirm dialog, cooldown timer (0-30s), auto-close modal on success.", component: "text" },
            t9: { label: "--- PROGRESS MODAL ---", component: "text", style: "hint" },
            t10: { label: "Live log with persistent/transient progress. Log and Debug tabs. Elapsed timer. Cancel support.", component: "text" },
            t11: { label: "--- THEME ---", component: "text", style: "hint" },
            t12: { label: "Auto / Light / Dark mode. Icon picker (7 icons). Font size slider. Badge text. Last reload timestamp.", component: "text" },
            t13: { label: "--- COMPATIBILITY ---", component: "text", style: "hint" },
            t14: { label: "Qlik Sense Enterprise 2024+, Qlik Cloud, air-gapped environments. Single file, zero external dependencies.", component: "text" },
            t15: { label: "---", component: "text", style: "hint" },
            t16: { label: "Developed by Godja Vasile — github.com/vasile-godja", component: "text" },
            t17: { label: "This extension is provided as-is. The author does not assume responsibility for maintenance, support, or future updates. Use at your own risk.", component: "text", style: "hint" }
          }
        }
      }
    },

    support: { snapshot: false, export: false, exportData: false }
  };
});
