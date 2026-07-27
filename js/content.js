/* Vow & Vice — generic page-copy loader.
   Reads site/data/content.json and fills any element whose id is "c-<key>"
   with the matching text. Add new editable copy by giving an element an id
   like id="c-my_new_field" and adding "my_new_field" to content.json (and to
   the CMS config so it's editable in the admin panel). */

const contentReady = fetch(IMG_BASE + 'data/content.json')
  .then(r => r.json())
  .then(data => {
    Object.keys(data).forEach(key => {
      const el = document.getElementById('c-' + key);
      if (el) el.textContent = data[key];
    });
    return data;
  });
