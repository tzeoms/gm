/* ==========================================================================
   Gamermaid — image-tools.js
   Shared helper functions for the Image Studio tool pages (upscaler,
   converter, resizer, compressor, cropper). Loaded BEFORE each page's own
   inline <script>. All functions are attached to window.GMImageTools so
   page scripts can call them without reimplementing this logic.
   ========================================================================== */

(function () {
  "use strict";

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  /* --------------------------------------------------------------------
     validateImageFile(file) -> { valid: boolean, error: string|null }
     -------------------------------------------------------------------- */
  function validateImageFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected." };
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return { valid: false, error: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File is too large. Please upload an image under 25MB." };
    }
    return { valid: true, error: null };
  }

  /* --------------------------------------------------------------------
     formatFileSize(bytes) -> "1.2 MB"
     -------------------------------------------------------------------- */
  function formatFileSize(bytes) {
    if (bytes === 0 || !isFinite(bytes) || bytes < 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return (exponent === 0 ? value.toFixed(0) : value.toFixed(1)) + " " + units[exponent];
  }

  /* --------------------------------------------------------------------
     estimateDataUrlBytes(dataUrl) -> approximate decoded byte size
     -------------------------------------------------------------------- */
  function estimateDataUrlBytes(dataUrl) {
    if (!dataUrl) return 0;
    const commaIndex = dataUrl.indexOf(",");
    const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    return Math.round((base64.length * 3) / 4);
  }

  /* --------------------------------------------------------------------
     wireDropzone(dropzoneEl, fileInputEl, onFile)
     Wires drag-and-drop + click-to-browse + file-input change on a
     dropzone. onFile receives the selected/dropped File.
     -------------------------------------------------------------------- */
  function wireDropzone(dropzoneEl, fileInputEl, onFile) {
    if (!dropzoneEl || !fileInputEl || typeof onFile !== "function") return;

    dropzoneEl.addEventListener("click", () => fileInputEl.click());
    dropzoneEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInputEl.click();
      }
    });

    ["dragenter", "dragover"].forEach((evt) => {
      dropzoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.add("is-dragover");
      });
    });

    ["dragleave", "dragend", "drop"].forEach((evt) => {
      dropzoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.remove("is-dragover");
      });
    });

    dropzoneEl.addEventListener("drop", (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) onFile(file);
    });

    fileInputEl.addEventListener("change", () => {
      const file = fileInputEl.files && fileInputEl.files[0];
      if (file) onFile(file);
    });
  }

  /* --------------------------------------------------------------------
     downloadResult(source, filename)
     source may be a <canvas> element or a data URL string.
     -------------------------------------------------------------------- */
  function downloadResult(source, filename) {
    let dataUrl = source;
    if (source && typeof source.toDataURL === "function") {
      dataUrl = source.toDataURL();
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename || "gamermaid-image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* --------------------------------------------------------------------
     readImageFile(file) -> Promise<HTMLImageElement>
     -------------------------------------------------------------------- */
  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  }

  window.GMImageTools = {
    ACCEPTED_TYPES,
    MAX_FILE_SIZE,
    validateImageFile,
    formatFileSize,
    estimateDataUrlBytes,
    wireDropzone,
    downloadResult,
    readImageFile,
  };
})();
