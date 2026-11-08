export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const date = value => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
export const badge = value => `<span class="badge badge-${escape(String(value).toLowerCase().replaceAll(' ', '-'))}">${escape(value)}</span>`;
export function options(items, selected = '', label = 'All') { return `<option value="">${escape(label)}</option>` + items.map(item => { const [value,text] = typeof item === 'string' ? [item,item] : [item.id,item.display_name ?? item.name]; return `<option value="${escape(value)}" ${selected===value?'selected':''}>${escape(text)}</option>`; }).join(''); }
