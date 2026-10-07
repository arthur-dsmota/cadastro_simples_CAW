CADASTRO SIMPLES — HTML, CSS E JAVASCRIPT

Campos: nome, e-mail e telefone.
Funções: cadastrar, consultar, alterar e imprimir relatório (ou salvar como PDF).
A pesquisa também filtra os registros do relatório.
O acesso usa e-mail como usuário e senha, com autenticação no Supabase.
Cada usuário acessa somente seus próprios registros.

ATIVAR O BANCO
1. Crie uma conta em https://supabase.com e um projeto no plano Free.
   O plano gratuito tem limites: https://supabase.com/pricing
2. No SQL Editor do projeto, cole e execute o conteúdo de banco.sql uma vez.
3. Em Authentication > Users > Add user, crie seu usuário com e-mail e senha.
   Confirme o e-mail pelo painel (Auto Confirm User), quando essa opção estiver disponível.
   Este exemplo usa contas criadas pelo administrador; não oferece cadastro público.
4. Copie a URL do projeto e sua chave PÚBLICA publishable (ou anon).
5. Abra o sistema e, em Configurar conexão com o banco, preencha URL e chave.
   Alternativamente, preencha os dois valores em config.js antes de hospedar.
6. Entre com o e-mail e a senha do usuário criado no passo 3.

IMPORTANTE
A senha do banco, a chave service_role e a chave sb_secret NÃO devem ir no HTML ou JavaScript.
A chave pública pode ser usada no navegador porque as políticas de segurança do banco
restringem os registros ao usuário autenticado. Não desative Row Level Security (RLS).
A senha é enviada apenas à API HTTPS do projeto e não é salva pelo aplicativo.
A sessão fica em memória: recarregar a página exige novo login. Após a expiração,
entre novamente. A conexão pública fica salva neste navegador.
O banco online ainda precisa ser configurado: não há dados de demonstração nem banco fictício.

ARQUIVOS
index.html: estrutura e formulário.
style.css: aparência responsiva e impressão.
app.js: autenticação, cadastro, alteração, consulta e relatório.
config.js: URL e chave pública.
banco.sql: tabela e regras de acesso.

EXECUÇÃO LOCAL
Sirva a pasta com um servidor estático, por exemplo a extensão Live Server do VS Code.
Não exige React, Bootstrap, Node.js no servidor ou bibliotecas JavaScript externas.

VALIDAÇÃO
Sintaxe JavaScript verificada. Login e operações reais precisam ser testados após
configurar um projeto Supabase. Teste também com uma segunda conta: os registros da
primeira não devem aparecer para a segunda.

REFERÊNCIAS
https://supabase.com/docs/guides/auth/passwords
https://supabase.com/docs/guides/database/postgres/row-level-security
