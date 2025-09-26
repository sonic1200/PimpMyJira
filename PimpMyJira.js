// ==UserScript==
// @name        Pimp My Jira!
// @description Enhances RapidBoard in Jira with toggles and formatting
// @author       Nicolas Mivielle
// @copyright    2025+, Nicolas Mivielle
// @match       https://*/jira/secure/RapidBoard.jspa*
// @match       https://*/jira/browse*
// @match       https://*/jira/projects*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @version     5.0
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG_DEFAULTS = {
    colorizeIssues: true,
    removeTypeIcon: false,
    addExtraFields: true,
    formatExtraFields: true,
    updateActionToolbar: true,
    colorizeActionToolbar: true,
    colorizeEpicPanel: true,
    reduceHeight: true,
  };
  const CONFIG_KEY = 'pimpMyJiraConfig';
  const $ = jQuery.noConflict(true);
  let CONFIG = loadConfig();
  let doingModifications = false;

  $(document).ready(() => {
    injectConfigUI();

    const observer = new MutationObserver(() => {
      if (!doingModifications) {
        doingModifications = true;
        setTimeout(() => {
          try {
            updateDOM();
          } catch (e) {
            console.error("[Pimp My Jira] Error:", e);
          } finally {
            doingModifications = false;
          }
        }, 100);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  function loadConfig() {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : { ...CONFIG_DEFAULTS };
  }
  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(CONFIG));
  }

    /* === Pimp My Jira — UI flottante (bouton + panneau) === */
function injectConfigUI() {
  // Évite les doublons si Jira recharge partiellement le DOM
  if ($('#pimp-config-btn').length) return;

  // ---------- Styles ----------
  if (!$('#pmj-style').length) {
    const css = `
      #pimp-config-btn{
        position:fixed; right:16px; bottom:16px;
        width:42px; height:42px; border-radius:50%;
        background:#0052CC; color:#fff; border:none;
        box-shadow:0 4px 12px rgba(0,0,0,.25);
        cursor:pointer; z-index:10000; opacity:.78;
        display:flex; align-items:center; justify-content:center;
        font-size:20px; line-height:1;
      }
      #pimp-config-btn:hover{ opacity:1 }
      #pimp-config{
        position:fixed; top:64px; right:16px; width:280px; max-height:70vh;
        overflow:auto; background:#fff; border:1px solid #dfe1e6;
        border-radius:10px; padding:12px; box-shadow:0 8px 20px rgba(0,0,0,.25);
        z-index:10001; /* au-dessus du bouton */
      }
      #pimp-config .pmj-header{
        font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:8px;
      }
      #pimp-config .pmj-row{
        display:flex; align-items:center; gap:8px; padding:6px 4px;
        border-radius:6px; user-select:none;
      }
      #pimp-config .pmj-row:hover{ background:#F4F5F7 }
      #pimp-config .pmj-close{
        margin-top:8px; width:100%; padding:6px 10px; border-radius:6px;
        background:#F4F5F7; border:1px solid #dfe1e6; cursor:pointer;
      }
      body.pmj-dragging{ cursor:grabbing !important; }
      @media (max-width: 768px){
        #pimp-config{ right:8px; left:8px; width:auto; }
      }
    `;
    $('head').append(`<style id="pmj-style">${css}</style>`);
  }

  // ---------- Bouton flottant ----------
  const $btn = $(
    `<button id="pimp-config-btn" type="button" title="Pimp My Jira Config" aria-label="Parameters">⚙️</button>`
  );

  // Restaure la position sauvegardée (si existante)
  try {
    const saved = JSON.parse(localStorage.getItem('pimpConfigBtnPos') || 'null');
    if (saved && typeof saved.left === 'string' && typeof saved.top === 'string') {
      $btn.css({ left: saved.left, top: saved.top, right: 'auto', bottom: 'auto' });
    }
  } catch (_) { /* ignore */ }

  $('body').append($btn);

  // ---------- Panneau ----------
  if (!$('#pimp-config').length) {
    const $panel = $(`
      <div id="pimp-config" role="dialog" aria-modal="true" aria-label="Paramètres Pimp My Jira" style="display:none">
        <div class="pmj-header">⚙️ Pimp My Jira</div>
        <div class="pmj-list"></div>
        <button type="button" class="pmj-close">Fermer</button>
      </div>
    `);

    const $list = $panel.find('.pmj-list');

    // On liste les clés actuelles de la config
    for (const key in CONFIG) {
      const id = `pmj-${key}`;
      const $row = $(`
        <label class="pmj-row" for="${id}">
          <input id="${id}" type="checkbox" ${CONFIG[key] ? 'checked' : ''}/>
          <span>${key}</span>
        </label>
      `);
      $row.find('input').on('change', function(){
        CONFIG[key] = this.checked;
        saveConfig();
        location.reload();
      });
      $list.append($row);
    }

    $panel.find('.pmj-close').on('click', () => $panel.hide());
    $('body').append($panel);
  }

  const $panel = $('#pimp-config');

  // ---------- Ouverture / Fermeture ----------
  $btn.on('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    $panel.toggle();
  });

  // Fermer sur Échap / clic extérieur
  $(document)
    .off('keydown.pmj').on('keydown.pmj', (e) => { if (e.key === 'Escape') $panel.hide(); })
    .off('click.pmj').on('click.pmj', (e) => {
      if (!$(e.target).closest('#pimp-config, #pimp-config-btn').length) $panel.hide();
    });

  // ---------- Drag du bouton (souris et tactile) ----------
  makeDraggable($btn, (pos) => {
    localStorage.setItem('pimpConfigBtnPos', JSON.stringify(pos));
  });
}

// Utilitaire de drag (conserve dans le viewport)
function makeDraggable($el, onStop) {
  let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  const getPoint = (ev) => ev.touches ? ev.touches[0] : ev;

  const onStart = (ev) => {
    const e = getPoint(ev);
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const off = $el.offset();
    startLeft = off.left; startTop = off.top;
    $('body').addClass('pmj-dragging');
    ev.preventDefault();
  };

  const onMove = (ev) => {
    if (!dragging) return;
    const e = getPoint(ev);
    const dx = e.clientX - startX, dy = e.clientY - startY;
    const newLeft = Math.max(0, Math.min(window.innerWidth - $el.outerWidth(), startLeft + dx));
    const newTop  = Math.max(0, Math.min(window.innerHeight - $el.outerHeight(), startTop + dy));
    $el.css({ left: newLeft, top: newTop, right: 'auto', bottom: 'auto' });
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    $('body').removeClass('pmj-dragging');
    const pos = { left: $el.css('left'), top: $el.css('top') };
    if (onStop) onStop(pos);
  };

  $el.on('mousedown touchstart', onStart);
  $(document).on('mousemove touchmove', onMove);
  $(document).on('mouseup touchend touchcancel', onEnd);
}


  function updateDOM() {
    if (CONFIG.removeUbiToolbar) {
      $("#dw-sm-verticalManaBarContainer, #dw-sm-loadingOverlay").remove();
      $('body').css('padding-left', '0');
    }
    if (CONFIG.colorizeIssues) colorizeIssues();
    if (CONFIG.updateActionToolbar) updateActionToolbar();
    if (CONFIG.addExtraFields) updateExtraFieldsJira8();
    if (CONFIG.formatExtraFields) formatExtraFields();
    if (CONFIG.colorizeEpicPanel) colorizeEpicPanel();
  }

  function colorizeIssues() {
    $('.js-issue').each(function() {
      const color = $(this).find('.ghx-grabber').css("background-color");
      if (color && !color.includes('a')) {
        const start = color.replace(')', ', 0)').replace('rgb', 'rgba');
        const stop = color.replace(')', ', 1)').replace('rgb', 'rgba');
        if (!$(this).find('.ghx-flag').length) {
          $(this).find('.ghx-issue-content').css("background", `linear-gradient(to left, ${start} 75%, ${stop})`);
        }
        if (CONFIG.removeTypeIcon) $(this).find('.ghx-type').remove();
      }
    });
  }

  function updateActionToolbar() {
    const container = $('#opsbar-opsbar-transitions'), dropdown = $('a#opsbar-transitions_more');
    if (!container.length || !dropdown.length || container.hasClass('pimped')) return;
    container.addClass('pimped');
    $('aui-dropdown-menu#opsbar-transitions_more_drop .issueaction-workflow-transition')
      .each(function() {
        const id = $(this).attr('id'), href = $(this).children().attr('href'),
          label = $(this).text();
        container.append(`<a id="${id}" class="aui-button toolbar-trigger issueaction-workflow-transition" href="${href}"><span class="trigger-label">${label}</span></a>`);
      });
    dropdown.closest('#opsbar-transitions_more').remove();
    if (CONFIG.colorizeActionToolbar) {
      $('.issueaction-workflow-transition').each(function() {
        const l = $(this).text().toLowerCase(), bg =
          ["reopen","open","reopened","need approval","devtest request"].includes(l) ? "#93C9FF" :
          ["resolve","resolved","test success","closed","issue closed","close"].includes(l) ? "#C1FFC4" :
          ["waiting for","need more info","blocked","test fail"].includes(l) ? "#FFD1D7" :
          l === "rejected" ? "#ADADAD" : "#FFD351";
        $(this).css('background', bg);
      });
    }
  }

 function updateExtraFieldsJira8(){
               $('.ghx-issue-content').each(function (index) {
                  if ($(this).find('div.ghx-row').next().length) {
                      $(this).find($("[class*='ghx-plan-extra-fields']")).insertAfter($(this).find('div.ghx-summary'));
                      }
            });
        $('.ghx-extra-field-seperator').remove();
        $('.ghx-issue-compact .ghx-row').css('height','auto');
        if (CONFIG.reduceHeight) $('div.ghx-row').css('margin','2px');
 }

 function formatExtraFields() {
    $('.ghx-issue-content').each(function() {
      const content = $(this);
      if (!( content.find('.ghx-extra-field-content').hasClass('aui-label ghx-label ghx-label-10') ||
             content.find('.ghx-extra-field-content').hasClass('aui-lozenge') )) {
        content.find('.ghx-extra-field').each(function() {
          const field = $(this), value = field.text().trim();
          const label = field.find('.ghx-extra-field-content');
          if (value.includes('<!--')) {
            const newString = field.html().substring(field.html().lastIndexOf('--&gt;')+6);
            field.html('<span class="ghx-extra-field-content">'+newString+'</span>');
          }
          switch(value) {
            case 'None': field.remove(); return;
            case 'Reopened': case 'To Do': case 'Open': case 'Submitted': case 'Need Approval':
              label.addClass('jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'); break;
            case 'In Progress': case 'In Design': case 'In Review': case 'Work Completed': case 'In Development': case 'In Dev Test': case 'QC test Request':
              label.addClass('jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'); break;
            case 'Need More Info': case 'Waiting For': case 'Blocked': case 'Suspended':
              label.addClass('jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium');
              label.css({ background:'red', color:'white' }); break;
            case 'Closed': case 'Done': case 'Resolved': case 'Verified': case 'Could Not Verified': case 'Rejected':
              label.addClass('jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'); break;
            default:
              label.addClass('aui-label ghx-label ghx-label-10');
          }
          label.css('margin-right','5px');
        });
      }
    });
    $('.ghx-extra-field-seperator').remove();
    $('.ghx-issue-compact .ghx-row').css('height','auto');
    $('span.ghx-extra-field-content.aui-label.ghx-label.ghx-label-10').css({
      backgroundColor:'#fff',borderColor:'#c1c7d0',color:'#42526e',
      border:'1px solid #dfe1e6',borderRadius:'3px',fontWeight:'bold',padding:'1px 2px'
    });
    ['max','min'].forEach(type => {
      const sel = `.ghx-column.ghx-busted-${type}`, bg=type==='max'?'#d04437':'#f6c342';
      $(`.ghx-column-headers ${sel}`).css({
        color:'#FFF',fontWeight:'bold',background:bg,
        borderBottomColor:bg,paddingLeft:'10px'
      });
      $(`.ghx-column-headers ${sel} h2`).css('color','#FFF');
      $(`.ghx-column-headers ${sel} .ghx-qty`).css('textShadow','2px 2px 3px #000');
    });
    $('.ghx-column-headers .ghx-constraint.ghx-busted').css({color:'#000',fontStyle:'italic'});
  }

  function colorizeEpicPanel() {
    $('div.ghx-inner').each(function() {
      const epicBorder = $(this).parent().css("border-right");
      const c = epicBorder.substring(epicBorder.lastIndexOf("rgb"));
      if (!c.includes('a')) {
        const s = c.replace(')', ', 0)').replace('rgb','rgba');
        const t = c.replace(')', ', 1)').replace('rgb','rgba');
        $(this).css("background", `linear-gradient(to right, ${s} 50%, ${t})`);
      }
    });
  }

})();
