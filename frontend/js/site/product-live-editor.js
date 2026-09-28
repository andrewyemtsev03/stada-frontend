/* Product-scoped live editor. Credentials and tokens are never persisted. */
(() => {
  const launch = document.createElement('button');
  launch.className = 'product-editor-launch';
  launch.textContent = 'Edit product';
  launch.type = 'button';
  launch.hidden = true;
  document.body.append(launch);
  const bar = document.createElement('div');
  bar.className = 'product-editor-bar';
  bar.hidden = true;
  bar.innerHTML = '<strong>● Live editor</strong><span data-editor-context></span><span role="status" aria-live="polite" data-editor-status>Click highlighted text or an image to edit.</span><button type="button" data-editor-save>Save changes</button><button type="button" data-editor-exit>Exit editor</button>';
  document.body.append(bar);
  const dialog = document.createElement('dialog');
  dialog.className = 'product-editor-dialog';
  document.body.append(dialog);
  let token = '', active = false, busy = false, changes = {}, snapshot = null, bindings = [];
  let scope, refreshNeeded = false;
  const hiddenImageAncestors = new Set();
  const status = text => { bar.querySelector('[data-editor-status]').textContent = text; };
  const dirty = () => Object.keys(changes).length > 0;
  async function api(action, body) {
    const response = await fetch(new URL(`/api/live-editor/${action}`, STADA_BACKEND_BASE_URL), {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify(body || {}), signal: AbortSignal.timeout(60000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Request failed. Please try again.');
    return data;
  }
  function setBusy(value) {
    busy = value;
    bar.querySelectorAll('button').forEach(button => { button.disabled = value; });
    bindings.forEach(({ node, image }) => { if (!image) node.contentEditable = String(!value); });
  }
  function closeDialog() { dialog.close(); launch.focus(); }
  launch.addEventListener('click', () => {
    if (!backendProductPayload?.product) return;
    dialog.innerHTML = '<form><h2>Product live editor</h2><p>Enter the password to edit this product in the current language. Changes go live when you save.</p><label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label><p role="alert" data-error></p><div class="product-editor-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Start editing</button></div></form>';
    dialog.querySelector('[data-cancel]').onclick = closeDialog;
    dialog.querySelector('form').onsubmit = async event => {
      event.preventDefault();
      const button = dialog.querySelector('[type=submit]');
      button.disabled = true;
      try {
        scope = { slug: getDynamicProductSlug(), country: getCountryConfig().backendCountry, lang: currentLang };
        const data = await api('login', { ...scope, password: dialog.querySelector('input').value });
        token = data.token;
        dialog.querySelector('input').value = '';
        dialog.close();
        snapshot = structuredClone(backendProductPayload);
        changes = {};
        refreshNeeded = false;
        active = true;
        launch.hidden = true;
        bar.hidden = false;
        bar.querySelector('[data-editor-context]').textContent = `${snapshot.product.name} · ${scope.country} · ${scope.lang.toUpperCase()}`;
        document.body.classList.add('product-editor-active');
        bindPage();
        status('Click highlighted text or an image to edit.');
        bar.querySelector('[data-editor-exit]').focus();
      } catch (error) { dialog.querySelector('[data-error]').textContent = error.message; }
      finally { button.disabled = false; }
    };
    dialog.showModal();
  });
  function changed(key, value) {
    changes[key] = value;
    status('Unsaved changes — save to publish.');
  }
  function textBinding(node, key, setter) {
    if (!node) return;
    const input = () => setter(node.innerText.trim());
    const paste = event => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (!node.contains(range.commonAncestorContainer)) return;
      range.deleteContents();
      const inserted = document.createTextNode(text);
      range.insertNode(inserted);
      range.setStartAfter(inserted);
      range.collapse(true);
      selection.removeAllRanges(); selection.addRange(range);
      input();
    };
    bindings.push({ node, input, paste, originalEditable: node.getAttribute('contenteditable') });
    node.contentEditable = 'true';
    node.classList.add('product-editor-target');
    node.addEventListener('input', input);
    node.addEventListener('paste', paste);
    node.dataset.editorLabel = key;
  }
  function imageBinding(node, key, setter) {
    if (!node) return;
    const hiddenAncestor = node.closest('[aria-hidden="true"]');
    if (hiddenAncestor) { hiddenImageAncestors.add(hiddenAncestor); hiddenAncestor.removeAttribute('aria-hidden'); }
    const click = event => { event.preventDefault(); event.stopPropagation(); if (!busy) editImage(node, setter); };
    const keydown = event => { if (event.key === 'Enter' || event.key === ' ') click(event); };
    bindings.push({ node, image: true, click, keydown, tabindex: node.getAttribute('tabindex'), role: node.getAttribute('role'), label: node.getAttribute('aria-label') });
    node.classList.add('product-editor-target');
    node.dataset.editorLabel = key;
    node.tabIndex = 0; node.setAttribute('role', 'button'); node.setAttribute('aria-label', `Edit ${key}`);
    node.addEventListener('click', click); node.addEventListener('keydown', keydown);
  }
  function bindPage() {
    const scalar = { title: 'name', kicker: 'kicker', lead: 'lead', 'overview-label': 'overviewLabel', 'overview-heading': 'overviewHeading', 'overview-intro': 'overviewIntro', 'formula-label': 'formulaLabel', 'formula-heading': 'formulaHeading', 'formula-intro': 'formulaIntro', 'usage-label': 'usageLabel', 'usage-heading': 'usageHeading', 'note-title': 'noteTitle', 'note-text': 'noteText', 'buy-intro': 'buyIntro' };
    Object.entries(scalar).forEach(([attr, key]) => textBinding(document.querySelector(`[data-product-${attr}]`), key, value => changed(key, value)));
    imageBinding(document.querySelector('[data-product-image]'), 'Product image', value => changed('image', value));
    imageBinding(document.querySelector('[data-product-formula-image]'), 'Formula image', value => changed('formulaImage', value));
    const page = snapshot.product.page || {};
    const lists = [
      ['badges', 'badges', null], ['benefits', 'benefits', null],
      ['metrics', 'metrics', { strong: 'value', span: 'title' }],
      ['facts', 'facts', { span: 'value', h3: 'title', p: 'text' }],
      ['formula-points', 'formulaPoints', { '.formula-point-media span': 'value', h3: 'title', p: 'text' }],
      ['usage-items', 'usageItems', { h3: 'title', p: 'text' }],
      ['partners', 'purchaseLinks', { p: 'label' }],
    ];
    lists.forEach(([attr, key, selectors]) => {
      const source = key === 'metrics' && !page.metrics?.length ? page.facts?.slice(0, 3) : page[key];
      const values = structuredClone(source || []);
      document.querySelectorAll(`[data-product-${attr}] > *`).forEach((item, index) => {
        if (!selectors) textBinding(item, key, value => { values[index] = value; changed(key, values); });
        else {
          values[index] ||= {};
          Object.entries(selectors).forEach(([selector, field]) => textBinding(item.querySelector(selector), `${key} ${field}`, value => { values[index][field] = value; changed(key, values); }));
          if (key === 'formulaPoints') imageBinding(item.querySelector('img'), 'Formula point image', value => { values[index].imageSrc = value; changed(key, values); });
          if (key === 'purchaseLinks') imageBinding(item.querySelector('img'), 'Partner logo', value => { values[index].logoSrc = value; changed(key, values); });
        }
      });
    });
  }
  function unbindPage() {
    bindings.forEach(binding => {
      const { node, image, input, paste, click, keydown } = binding;
      node.classList.remove('product-editor-target'); delete node.dataset.editorLabel;
      const restore = (attr, value) => value === null ? node.removeAttribute(attr) : node.setAttribute(attr, value);
      if (image) {
        node.removeEventListener('click', click); node.removeEventListener('keydown', keydown);
        restore('tabindex', binding.tabindex); restore('role', binding.role); restore('aria-label', binding.label);
      } else {
        node.removeEventListener('input', input); node.removeEventListener('paste', paste);
        restore('contenteditable', binding.originalEditable);
      }
    });
    bindings = [];
    hiddenImageAncestors.forEach(node => node.setAttribute('aria-hidden', 'true'));
    hiddenImageAncestors.clear();
  }
  function editImage(node, setter) {
    dialog.innerHTML = '<form><h2>Replace image</h2><p>Paste an image URL or upload a PNG, JPEG, or WebP (up to 8 MB). Product images are shared across languages.</p><label>Image URL<input type="url" name="url" required></label><label>Upload image<input type="file" accept="image/png,image/jpeg,image/webp"></label><p role="alert" data-error></p><div class="product-editor-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Use image</button></div></form>';
    const urlInput = dialog.querySelector('[name=url]');
    urlInput.value = node.src;
    dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
    dialog.querySelector('[type=file]').onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
      const errorNode = dialog.querySelector('[data-error]');
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { errorNode.textContent = 'Choose a PNG, JPEG, or WebP up to 8 MB.'; return; }
      const submit = dialog.querySelector('[type=submit]');
      submit.disabled = true; setBusy(true); errorNode.textContent = 'Uploading…';
      event.target.disabled = true;
      const preventClose = event => event.preventDefault();
      dialog.addEventListener('cancel', preventClose);
      dialog.querySelector('[data-cancel]').disabled = true;
      try {
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        const data = await api('upload', { dataUrl, fileName: file.name });
        urlInput.value = data.image.secureUrl;
        errorNode.textContent = 'Uploaded. Choose Use image to preview, then Save changes to publish.';
      } catch (error) { errorNode.textContent = error.message || 'Upload failed.'; }
      finally { submit.disabled = false; event.target.disabled = false; setBusy(false); dialog.removeEventListener('cancel', preventClose); dialog.querySelector('[data-cancel]').disabled = false; }
    };
    dialog.querySelector('form').onsubmit = event => {
      event.preventDefault();
      try {
        const url = new URL(urlInput.value);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS image URL.');
        node.src = url.href; setter(url.href); dialog.close(); node.focus();
      } catch (error) { dialog.querySelector('[data-error]').textContent = error.message; }
    };
    dialog.showModal();
  }
  bar.querySelector('[data-editor-save]').onclick = async () => {
    if (!dirty()) { status('No changes to save.'); return; }
    setBusy(true); status('Saving…');
    try {
      await api('save', { changes });
      changes = {};
      refreshNeeded = true;
      // Clear cached product responses so saved content is used after exit or locale changes.
      Object.keys(backendProductCache).forEach(key => delete backendProductCache[key]);
      const payload = await fetchBackendProduct(scope.lang);
      unbindPage();
      snapshot = structuredClone(payload);
      refreshNeeded = false;
      renderDynamicProductPage(payload);
      bindPage();
      status('Saved — your changes are live.');
    } catch (error) { status(refreshNeeded ? 'Saved, but the preview could not refresh. Exit the editor to reload the saved page.' : error.message); }
    finally { setBusy(false); }
  };
  bar.querySelector('[data-editor-exit]').onclick = async () => {
    if (busy || (dirty() && !window.confirm('Discard unsaved changes and exit the editor?'))) return;
    setBusy(true);
    try { await api('logout'); } catch (_) { /* Tokens expire automatically if the connection is lost. */ }
    token = ''; active = false; changes = {};
    unbindPage();
    document.body.classList.remove('product-editor-active');
    bar.hidden = true; launch.hidden = false;
    if (refreshNeeded) { window.location.reload(); return; }
    renderDynamicProductPage(snapshot);
    setBusy(false); launch.focus();
  };
  // Lock navigation and locale changes while editing; Exit handles discarding safely.
  document.addEventListener('click', event => {
    if (!active || bar.contains(event.target) || dialog.contains(event.target)) return;
    const navigation = event.target.closest('a, .lang-option, [data-country]');
    if (navigation?.matches('a[href="#pharmacy-partners"]')) return;
    const editable = event.target.closest('.product-editor-target');
    if (editable) {
      if (navigation) { event.preventDefault(); editable.focus(); }
      return;
    }
    if (navigation) { event.preventDefault(); event.stopImmediatePropagation(); status('Exit the editor before navigating or changing language/country.'); }
  }, true);
  window.addEventListener('beforeunload', event => {
    if (active && (dirty() || busy)) { event.preventDefault(); event.returnValue = ''; }
  });
  document.addEventListener('stada:dynamicproductrender', () => { launch.hidden = active; });
})();
