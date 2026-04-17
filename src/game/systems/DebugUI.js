export default class DebugUI {
  constructor(scene) {
    this.scene = scene;
    
    // Global debug state
    window.debugConfig = {
      fbOffsetX: -20,
      fbOffsetY: -70,
      fbOriginX: 0.1,
      fbOriginY: 0.5,
      fbScale: 2.0
    };

    this.createPanel();
  }

  createPanel() {
    const container = document.createElement('div');
    container.id = 'debug-panel';
    Object.assign(container.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '240px',
      padding: '15px',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '8px',
      border: '1px solid #444',
      zIndex: '10000',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
    });

    const title = document.createElement('h3');
    title.innerText = '🔥 FIREBALL DEBUGGER';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#ff9900';
    container.appendChild(title);

    this.addSlider(container, 'Spawn X', 'fbOffsetX', -100, 100);
    this.addSlider(container, 'Spawn Y', 'fbOffsetY', -200, 50);
    this.addSlider(container, 'Origin X', 'fbOriginX', 0, 1, 0.05);
    this.addSlider(container, 'Scale', 'fbScale', 0.5, 5.0, 0.1);

    const btn = document.createElement('button');
    btn.innerText = 'CLOSE DEBUG';
    btn.style.marginTop = '10px';
    btn.style.width = '100%';
    btn.onclick = () => container.remove();
    container.appendChild(btn);

    // --- Animation Preview Section ---
    const previewContainer = document.createElement('div');
    previewContainer.style.marginTop = '20px';
    previewContainer.style.borderTop = '1px solid #444';
    previewContainer.style.paddingTop = '15px';
    previewContainer.style.textAlign = 'center';
    previewContainer.style.minHeight = '140px';
    previewContainer.style.display = 'flex';
    previewContainer.style.flexDirection = 'column';
    previewContainer.style.alignItems = 'center';

    const previewTitle = document.createElement('div');
    previewTitle.innerText = 'PLASMA PREVIEW';
    previewTitle.style.marginBottom = '20px';
    previewTitle.style.color = '#00ffff';
    previewContainer.appendChild(previewTitle);

    // This will represent the plasma ball
    const plasmaBox = document.createElement('div');
    plasmaBox.id = 'debug-plasma-preview';
    Object.assign(plasmaBox.style, {
        width: '40px',
        height: '40px',
        margin: '20px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
        transform: `scale(${window.debugConfig.fbScale})`,
        position: 'relative'
    });

    previewContainer.appendChild(plasmaBox);
    container.appendChild(previewContainer);

    document.body.appendChild(container);

    // Start local animation loop for the preview
    setInterval(() => {
        // Live sync with config
        plasmaBox.style.transform = `scale(${window.debugConfig.fbScale})`;
        // Random flickering glow
        const glowOpacity = 0.5 + Math.random() * 0.5;
        plasmaBox.style.boxShadow = `0 0 10px rgba(0,255,255,${glowOpacity}), 0 0 20px #00ffff, 0 0 40px #00ffff`;
    }, 80);
  }

  addSlider(parent, label, key, min, max, step = 1) {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '10px';
    
    const labelEl = document.createElement('div');
    labelEl.innerText = `${label}: ${window.debugConfig[key]}`;
    wrap.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = window.debugConfig[key];
    input.style.width = '100%';

    input.oninput = (e) => {
      const val = parseFloat(e.target.value);
      window.debugConfig[key] = val;
      labelEl.innerText = `${label}: ${val}`;
    };

    wrap.appendChild(input);
    parent.appendChild(wrap);
  }
}
