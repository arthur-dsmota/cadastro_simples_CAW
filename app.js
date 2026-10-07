// Atalho para selecionar elementos da interface.
const $ = id => document.getElementById(id);
let config = window.APP_CONFIG, session = null, records = [], editing = null, loaded = false;
try { config = JSON.parse(localStorage.getItem('cadastro.config')) || config; } catch {}
$('url').value = config.url; $('key').value = config.key;
if (!config.url || !config.key) $('setup').open = true;
function message(text, error = false) { $('message').textContent = text; $('message').className = error ? 'error' : ''; }
// Todas as requisições autenticadas passam pela API do Supabase.
async function request(path, options = {}) {
 const headers = { apikey: config.key, 'Content-Type': 'application/json', ...options.headers };
 if (session) headers.Authorization = 'Bearer ' + session.access_token;
 let response;
 try { response = await fetch(config.url + path, { ...options, headers }); }
 catch { throw Error('Não foi possível conectar. Verifique a internet e a URL do projeto.'); }
 const data = await response.json().catch(() => null);
 if (!response.ok) {
  if (response.status === 401 && session) { clearSession(); throw Error('Sessão expirada. Entre novamente.'); }
  throw Error(data?.msg || data?.message || data?.error_description || 'Não foi possível concluir a operação.');
 }
 return data;
}
// A configuração local contém apenas dados públicos, nunca senhas.
$('configuration').onsubmit = e => {
 e.preventDefault();
 try {
  const url = new URL($('url').value.trim());
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.port) throw Error('Informe a URL HTTPS do seu projeto Supabase.');
  const key = $('key').value.trim();
  if (key.startsWith('sb_secret_')) throw Error('Use a chave pública, nunca a chave secreta.');
  if (!key.startsWith('sb_publishable_')) {
   let payload; try { payload = JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch {}
   if (payload?.role !== 'anon') throw Error('Informe uma chave publishable ou anon válida.');
  }
  config = { url: url.origin, key }; localStorage.setItem('cadastro.config', JSON.stringify(config));
  $('setup').open = false; message('Conexão configurada. Entre com um usuário criado no Supabase.');
 } catch (err) { message(err.message, true); }
};
$('login').onsubmit = async e => {
 e.preventDefault(); const button = e.submitter; button.disabled = true;
 try {
  if (!config.url || !config.key) throw Error('Configure a conexão com o banco antes de entrar.');
  session = await request('/auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email:$('emailLogin').value.trim(), password:$('password').value }) });
  $('password').value = ''; $('access').hidden = true; $('workspace').hidden = false; $('logout').hidden = false;
  $('account').textContent = session.user.email; await load(); message('Acesso autorizado.');
 } catch (err) { message(err.message, true); } finally { button.disabled = false; }
};
function clearSession() { session = null; records = []; loaded = false; reset(); render(); $('workspace').hidden = true; $('access').hidden = false; $('logout').hidden = true; }
$('logout').onclick = async () => { try { await request('/auth/v1/logout', {method:'POST'}); clearSession(); message('Você saiu da conta.'); } catch(err) { message(err.message, true); } };
// Busca todas as páginas para o relatório não ficar limitado a mil registros.
async function load() {
 loaded = false; $('report').disabled = true; const result = [];
 for (let offset = 0; ; offset += 500) {
  const page = await request('/rest/v1/contatos?select=id,nome,email,telefone&order=nome.asc,id.asc&limit=500&offset=' + offset);
  result.push(...page); if (page.length < 500) break;
 }
 records = result; loaded = true; $('report').disabled = false; render();
}
function filtered() { const term = $('search').value.trim().toLocaleLowerCase('pt-BR'); return records.filter(r => [r.nome,r.email,r.telefone].some(v => v.toLocaleLowerCase('pt-BR').includes(term))); }
// textContent evita interpretar dados cadastrados como código HTML.
function render() {
 const list = filtered(); $('rows').replaceChildren(); $('count').textContent = list.length + ' registro(s)'; $('empty').hidden = !!list.length;
 $('empty').textContent = records.length ? 'Nenhum resultado para esta pesquisa.' : 'Nenhum cadastro. Preencha o formulário para começar.';
 list.forEach(r => { const tr = document.createElement('tr'); [r.nome,r.email,r.telefone].forEach(value => {const td = document.createElement('td');td.textContent = value;tr.append(td);}); const td = document.createElement('td'), button = document.createElement('button'); button.textContent = 'Alterar'; button.onclick = () => edit(r); td.append(button);tr.append(td);$('rows').append(tr); });
}
function edit(r) { editing = r.id; $('name').value = r.nome; $('email').value = r.email; $('phone').value = r.telefone; $('formTitle').textContent = 'Alterar cadastro'; $('save').textContent = 'Salvar alteração'; $('cancel').hidden = false; $('name').focus(); }
function reset() { editing = null; $('contact').reset(); $('formTitle').textContent = 'Novo cadastro'; $('save').textContent = 'Salvar cadastro'; $('cancel').hidden = true; }
$('cancel').onclick = reset; $('search').oninput = render;
$('contact').onsubmit = async e => {
 e.preventDefault(); $('save').disabled = true; const id = editing;
 try {
  const data = { nome:$('name').value.trim(), email:$('email').value.trim(), telefone:$('phone').value.trim() };
  if (!data.nome || !/^[0-9+() .-]{8,25}$/.test(data.telefone)) throw Error('Confira o nome e o telefone.');
  const saved = await request('/rest/v1/contatos' + (id ? '?id=eq.' + encodeURIComponent(id) : ''), {method:id ? 'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(data)});
  if (!saved?.length) throw Error('Registro não encontrado ou sem permissão para alteração.');
  reset(); message(id ? 'Alteração salva.' : 'Cadastro salvo.');
  try { await load(); } catch(err) { message('Dados salvos, mas a consulta não foi atualizada. Saia e entre novamente. ' + err.message, true); }
 } catch(err) { message(err.message, true); } finally { $('save').disabled = false; }
};
$('report').onclick = () => {
 if (!loaded) return message('Entre novamente para carregar os registros antes de gerar o relatório.', true);
 $('printMeta').textContent = 'Relatório de contatos • ' + new Date().toLocaleString('pt-BR') + ' • ' + filtered().length + ' registro(s)' + ($('search').value ? ' • Pesquisa: ' + $('search').value : ''); window.print();
};
// Integração opcional: consulta os mesmos registros exibidos na interface.
if (document.modelContext?.registerTool) {
 Promise.resolve(document.modelContext.registerTool({name:'consultar_contatos',description:'Filtra os contatos carregados da conta autenticada.',inputSchema:{type:'object',properties:{termo:{type:'string'}},required:['termo'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if (!session || !loaded) throw Error('Entre e carregue os contatos.');if(typeof input.termo !== 'string')throw Error('Termo inválido.');$('search').value=input.termo;render();return {contatos:filtered()};}})).catch(()=>{});
}
