/**
 * FARMDB Floating Draggable & Resizable Window Manager
 */

export function setupDraggableWindow(windowEl, titlebarEl, resizeHandleEl) {
  let isDragging = false;
  let isResizing = false;
  let activeResizeDir = 'se';
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let isMaximized = false;
  let preMaximizeState = null;

  function updateScreenClasses(width, height) {
    if (height <= 380) {
      windowEl.classList.add('short-screen');
    } else {
      windowEl.classList.remove('short-screen');
    }

    if (height <= 285) {
      windowEl.classList.add('ultra-short-screen');
    } else {
      windowEl.classList.remove('ultra-short-screen');
    }

    if (width <= 520) {
      windowEl.classList.add('narrow-screen');
    } else {
      windowEl.classList.remove('narrow-screen');
    }
  }

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
        updateScreenClasses(pos.width, pos.height);
      }
    }
  } catch (e) {
    // Ignore storage error
  }

  // Initial check on load
  const curRect = windowEl.getBoundingClientRect();
  if (curRect.width && curRect.height) {
    updateScreenClasses(curRect.width, curRect.height);
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
    if (isMaximized || windowEl.classList.contains('minimized')) return;

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

      const minW = 340;
      const minH = 200;
      const maxW = window.innerWidth - 20;
      const maxH = window.innerHeight - 40;

      let newW = initialWidth;
      let newH = initialHeight;
      let newL = initialLeft;
      let newT = initialTop;

      // Horizontal resizing
      if (activeResizeDir.includes('e')) {
        newW = Math.max(minW, Math.min(initialWidth + dx, maxW));
        if (initialLeft + newW > window.innerWidth - 10) {
          newW = Math.max(minW, window.innerWidth - 10 - initialLeft);
        }
      } else if (activeResizeDir.includes('w')) {
        newW = Math.max(minW, Math.min(initialWidth - dx, maxW));
        newL = initialLeft + (initialWidth - newW);
        if (newL < 10) {
          newW = Math.max(minW, initialLeft + initialWidth - 10);
          newL = 10;
        }
      }

      // Vertical resizing
      if (activeResizeDir.includes('s')) {
        newH = Math.max(minH, Math.min(initialHeight + dy, maxH));
        if (initialTop + newH > window.innerHeight - 10) {
          newH = Math.max(minH, window.innerHeight - 10 - initialTop);
        }
      } else if (activeResizeDir.includes('n')) {
        newH = Math.max(minH, Math.min(initialHeight - dy, maxH));
        newT = initialTop + (initialHeight - newH);
        if (newT < 40) {
          newH = Math.max(minH, initialTop + initialHeight - 40);
          newT = 40;
        }
      }

      windowEl.style.width = `${newW}px`;
      windowEl.style.height = `${newH}px`;
      if (activeResizeDir.includes('w')) {
        windowEl.style.left = `${newL}px`;
      }
      if (activeResizeDir.includes('n')) {
        windowEl.style.top = `${newT}px`;
      }

      updateScreenClasses(newW, newH);
    }
  }

  function onMouseUp() {
    if (isDragging || isResizing) {
      isDragging = false;
      isResizing = false;
      windowEl.classList.remove('is-dragging');
      windowEl.classList.remove('is-resizing');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      savePosition();
    }
  }

  // --- 8-DIRECTIONAL RESIZING ---
  function startResize(e, dir = 'se') {
    e.stopPropagation();
    e.preventDefault();
    if (isMaximized || windowEl.classList.contains('minimized')) return;

    isResizing = true;
    activeResizeDir = dir;
    startX = e.clientX;
    startY = e.clientY;
    const rect = windowEl.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    initialWidth = rect.width;
    initialHeight = rect.height;

    // Ensure explicit left/top are set
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.left = `${initialLeft}px`;
    windowEl.style.top = `${initialTop}px`;
    windowEl.classList.add('is-resizing');

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Bind all 8 resizers
  const winResizers = windowEl.querySelectorAll('.win-resizer');
  winResizers.forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
      const dir = resizer.dataset.dir || 'se';
      startResize(e, dir);
    });
  });

  // Status bar handle fallback
  if (resizeHandleEl) {
    resizeHandleEl.addEventListener('mousedown', (e) => {
      startResize(e, 'se');
    });
  }

  // --- DRAGGABLE SCHEMA SPLIT GUTTER ---
  const splitGutter = windowEl.querySelector('#schema-split-gutter');
  const schemaPane = windowEl.querySelector('#schema-pane');
  if (splitGutter && schemaPane) {
    let isSplitDragging = false;
    let splitStartX = 0;
    let initialSchemaW = 0;

    splitGutter.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isSplitDragging = true;
      splitStartX = e.clientX;
      initialSchemaW = schemaPane.offsetWidth;
      splitGutter.classList.add('is-dragging');

      const onSplitMove = (ev) => {
        if (!isSplitDragging) return;
        const delta = splitStartX - ev.clientX; // moving left widens schema
        const maxW = Math.max(180, windowEl.offsetWidth - 200);
        const newW = Math.max(160, Math.min(initialSchemaW + delta, maxW));
        schemaPane.style.width = `${newW}px`;
      };

      const onSplitUp = () => {
        isSplitDragging = false;
        splitGutter.classList.remove('is-dragging');
        document.removeEventListener('mousemove', onSplitMove);
        document.removeEventListener('mouseup', onSplitUp);
      };

      document.addEventListener('mousemove', onSplitMove);
      document.addEventListener('mouseup', onSplitUp);
    });

    splitGutter.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      schemaPane.style.width = '240px';
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
