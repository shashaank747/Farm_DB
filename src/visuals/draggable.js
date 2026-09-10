/**
 * FARMDB Floating Draggable & Resizable Window Manager
 */

export function setupDraggableWindow(windowEl, titlebarEl, resizeHandleEl) {
  let isDragging = false;
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let isMaximized = false;
  let preMaximizeState = null;

  // Restore stored position if any
  try {
    const saved = localStorage.getItem('farmdb_terminal_pos');
    if (saved) {
      const pos = JSON.parse(saved);
      if (pos.left && pos.top) {
        windowEl.style.left = `${Math.min(pos.left, window.innerWidth - 300)}px`;
        windowEl.style.top = `${Math.min(pos.top, window.innerHeight - 150)}px`;
        windowEl.style.right = 'auto';
      }
      if (pos.width && pos.height) {
        windowEl.style.width = `${pos.width}px`;
        windowEl.style.height = `${pos.height}px`;
      }
    }
  } catch (e) {
    // Ignore storage error
  }

  function savePosition() {
    try {
      const rect = windowEl.getBoundingClientRect();
      localStorage.setItem('farmdb_terminal_pos', JSON.stringify({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }));
    } catch (e) { }
  }

  // --- DRAGGING ---
  titlebarEl.addEventListener('mousedown', (e) => {
    // Don't drag if clicking buttons inside titlebar
    if (e.target.closest('.win-btn')) return;
    if (isMaximized) return;

    isDragging = true;
    windowEl.classList.add('is-dragging');
    const rect = windowEl.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    // Reset right/bottom positioning to explicit top/left
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.left = `${initialLeft}px`;
    windowEl.style.top = `${initialTop}px`;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Keep within bounds
      newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - windowEl.offsetWidth - 10));
      newTop = Math.max(60, Math.min(newTop, window.innerHeight - windowEl.offsetHeight - 10));

      windowEl.style.left = `${newLeft}px`;
      windowEl.style.top = `${newTop}px`;
    } else if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newWidth = Math.max(380, Math.min(initialWidth + dx, window.innerWidth - 40));
      const newHeight = Math.max(260, Math.min(initialHeight + dy, window.innerHeight - 80));

      windowEl.style.width = `${newWidth}px`;
      windowEl.style.height = `${newHeight}px`;
    }
  }

  function onMouseUp() {
    if (isDragging || isResizing) {
      isDragging = false;
      isResizing = false;
      windowEl.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      savePosition();
    }
  }

  // --- RESIZING ---
  if (resizeHandleEl) {
    resizeHandleEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isMaximized) return;

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = windowEl.getBoundingClientRect();
      initialWidth = rect.width;
      initialHeight = rect.height;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // --- MINIMIZE / MAXIMIZE / CLOSE / REOPEN ---
  const minBtn = windowEl.querySelector('.min-btn');
  const maxBtn = windowEl.querySelector('.max-btn');
  const closeBtn = windowEl.querySelector('.close-btn');
  const restoreBtn = windowEl.querySelector('#btn-restore-from-report');
  let preMinimizeState = null;

  function restoreWindow() {
    windowEl.classList.remove('minimized');
    if (preMinimizeState) {
      windowEl.style.width = preMinimizeState.width || '';
      windowEl.style.height = preMinimizeState.height || '';
    }
    if (minBtn) {
      minBtn.textContent = '_';
      minBtn.title = 'Minimize to Farm Report';
    }
    const titleText = windowEl.querySelector('#terminal-title-text');
    if (titleText) titleText.textContent = 'FARMDB SQL Studio';
    const titleIcon = windowEl.querySelector('#terminal-title-icon');
    if (titleIcon) titleIcon.textContent = '🌾';
    savePosition();
  }

  function minimizeWindow() {
    preMinimizeState = {
      width: windowEl.style.width,
      height: windowEl.style.height
    };
    // Clear inline width/height so CSS .minimized rules take effect cleanly
    windowEl.style.width = '';
    windowEl.style.height = '';
    windowEl.classList.add('minimized');
    if (minBtn) {
      minBtn.textContent = '⤢';
      minBtn.title = 'Restore SQL Studio';
    }
    const titleText = windowEl.querySelector('#terminal-title-text');
    if (titleText) titleText.textContent = 'FARM MONITOR • Live Dispatch';
    const titleIcon = windowEl.querySelector('#terminal-title-icon');
    if (titleIcon) titleIcon.textContent = '📊';

    // Trigger immediate farm quick report update if function exists
    if (typeof window.renderFarmQuickReport === 'function') {
      window.renderFarmQuickReport();
    }
    savePosition();
  }

  function toggleMinimize() {
    if (windowEl.classList.contains('minimized')) {
      restoreWindow();
    } else {
      minimizeWindow();
    }
  }

  if (minBtn) {
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMinimize();
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      restoreWindow();
    });
  }

  // Double click titlebar to toggle minimize / maximize
  titlebarEl.addEventListener('dblclick', (e) => {
    if (e.target.closest('.win-btn')) return;
    if (windowEl.classList.contains('minimized')) {
      restoreWindow();
    } else {
      maxBtn?.click();
    }
  });

  if (maxBtn) {
    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (windowEl.classList.contains('minimized')) {
        restoreWindow();
      }
      if (!isMaximized) {
        preMaximizeState = {
          left: windowEl.style.left,
          top: windowEl.style.top,
          width: windowEl.style.width,
          height: windowEl.style.height
        };
        windowEl.style.left = '20px';
        windowEl.style.top = '70px';
        windowEl.style.width = `${window.innerWidth - 40}px`;
        windowEl.style.height = `${window.innerHeight - 90}px`;
        windowEl.classList.remove('minimized');
        isMaximized = true;
        maxBtn.textContent = '❐';
      } else {
        if (preMaximizeState) {
          windowEl.style.left = preMaximizeState.left;
          windowEl.style.top = preMaximizeState.top;
          windowEl.style.width = preMaximizeState.width;
          windowEl.style.height = preMaximizeState.height;
        }
        isMaximized = false;
        maxBtn.textContent = '□';
      }
      savePosition();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      windowEl.style.display = 'none';
      const trigger = document.getElementById('btn-toggle-terminal');
      if (trigger) trigger.style.display = 'flex';
    });
  }

  // Open / Restore helper
  return {
    open: () => {
      windowEl.style.display = 'flex';
      restoreWindow();
      const trigger = document.getElementById('btn-toggle-terminal');
      if (trigger) trigger.style.display = 'none';
    },
    close: () => {
      windowEl.style.display = 'none';
      const trigger = document.getElementById('btn-toggle-terminal');
      if (trigger) trigger.style.display = 'flex';
    },
    minimize: minimizeWindow,
    restore: restoreWindow
  };
}
