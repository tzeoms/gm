// builder.js - Visual Website Builder (Admin Only)
(function () {
    // Check if admin flag is present in URL (?admin=true) or stored session
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true' || sessionStorage.getItem('gamermaid_admin') === 'true';

    // Secret shortcut listener: Ctrl + Shift + E (or Cmd + Shift + E on Mac)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
            sessionStorage.setItem('gamermaid_admin', 'true');
            initBuilder();
        }
    });

    if (isAdmin) {
        sessionStorage.setItem('gamermaid_admin', 'true');
        window.addEventListener('DOMContentLoaded', initBuilder);
    }

    function initBuilder() {
        if (document.getElementById('builderToggleBtn')) return;

        // Inject Builder CSS
        const style = document.createElement('style');
        style.textContent = `
            .builder-toolbar {
                position: fixed;
                top: 86px;
                left: 50%;
                transform: translateX(-50%);
                background: #0f172a;
                color: white;
                padding: 8px 16px;
                border-radius: 9999px;
                display: none;
                align-items: center;
                gap: 12px;
                z-index: 3000;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                font-size: 0.85rem;
            }
            .builder-toolbar.active { display: flex; }
            .builder-toggle-btn {
                position: fixed;
                bottom: 24px;
                left: 24px;
                background: #0f172a;
                color: #ffffff;
                padding: 10px 18px;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.85rem;
                box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
                cursor: pointer;
                z-index: 3000;
                display: flex;
                align-items: center;
                gap: 6px;
                border: none;
            }
            .builder-toggle-btn:hover { background: #1e293b; }
            body.builder-mode [contenteditable="true"] {
                outline: 2px dashed #8b5cf6 !important;
                outline-offset: 4px;
                cursor: text;
            }
        `;
        document.head.appendChild(style);

        // Inject Builder HTML Elements
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'builderToggleBtn';
        toggleBtn.className = 'builder-toggle-btn';
        toggleBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span>Admin Builder Mode</span>
        `;
        document.body.appendChild(toggleBtn);

        const toolbar = document.createElement('div');
        toolbar.id = 'builderToolbar';
        toolbar.className = 'builder-toolbar';
        toolbar.innerHTML = `
            <span><b>Admin Editing:</b> Click any text to edit.</span>
            <label>Text Color: <input type="color" id="textColorPicker" value="#0f172a"></label>
            <button id="saveChangesBtn" style="background: #8b5cf6; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 600; border:none; cursor:pointer;">Save & Export</button>
        `;
        document.body.appendChild(toolbar);

        // Builder Logic
        let builderActive = false;
        let selectedElement = null;

        toggleBtn.addEventListener('click', () => {
            builderActive = !builderActive;
            document.body.classList.toggle('builder-mode', builderActive);
            toolbar.classList.toggle('active', builderActive);

            const textElements = document.querySelectorAll('h1, h2, h3, p, span, label, a, button');
            textElements.forEach(el => {
                if (builderActive) {
                    el.setAttribute('contenteditable', 'true');
                    el.addEventListener('click', selectElementForEditing);
                } else {
                    el.removeAttribute('contenteditable');
                    el.removeEventListener('click', selectElementForEditing);
                }
            });
        });

        function selectElementForEditing(e) {
            if (!builderActive) return;
            e.stopPropagation();
            selectedElement = e.target;
        }

        document.getElementById('textColorPicker').addEventListener('input', (e) => {
            if (selectedElement) {
                selectedElement.style.color = e.target.value;
            }
        });

        document.getElementById('saveChangesBtn').addEventListener('click', () => {
            document.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            
            // Remove injected builder elements before saving export
            toggleBtn.remove();
            toolbar.remove();
            style.remove();

            const updatedHtml = document.documentElement.outerHTML;

            const blob = new Blob([updatedHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            alert('Changes saved! Downloaded index.html can now be uploaded to GitHub.');
            location.reload();
        });
    }
})();
