/* Small, safe product-text format: # title, ## subtitle, **bold**. No HTML. */
window.StadaProductText = (() => {
  function render(container, source) {
    container.replaceChildren();
    String(source || '').split(/\r?\n/).forEach(line => {
      if (!line.trim()) return;
      const heading = line.match(/^(#{1,2})\s+(.+)$/);
      const element = document.createElement(heading ? (heading[1].length === 1 ? 'h2' : 'h3') : 'p');
      const text = heading ? heading[2] : line;
      text.split(/(\*\*[^*]+\*\*)/g).forEach(part => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const strong = document.createElement('strong'); strong.textContent = part.slice(2, -2); element.append(strong);
        } else element.append(document.createTextNode(part));
      });
      container.append(element);
    });
  }
  function toolbar(textarea) {
    const bar = document.createElement('div');
    bar.className = 'product-text-toolbar';
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Text formatting');
    ['Title', 'Subtitle', 'Body', 'Bold'].forEach(label => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.addEventListener('mousedown', event => event.preventDefault());
      button.onclick = () => {
        const start = textarea.selectionStart, end = textarea.selectionEnd, value = textarea.value;
        if (label === 'Bold') {
          const selected = value.slice(start, end) || 'bold text';
          const replacement = selected.startsWith('**') && selected.endsWith('**') ? selected.slice(2, -2) : `**${selected}**`;
          textarea.setRangeText(replacement, start, end, 'select');
        } else {
          const from = value.lastIndexOf('\n', start - 1) + 1;
          const next = value.indexOf('\n', end);
          const to = next < 0 ? value.length : next;
          const prefix = label === 'Title' ? '# ' : label === 'Subtitle' ? '## ' : '';
          const replacement = value.slice(from, to).split('\n').map(line => prefix + line.replace(/^#{1,2}\s+/, '')).join('\n');
          textarea.setRangeText(replacement, from, to, 'select');
        }
        textarea.focus(); textarea.dispatchEvent(new Event('input', { bubbles: true }));
      };
      bar.append(button);
    });
    return bar;
  }
  return { render, toolbar };
})();
