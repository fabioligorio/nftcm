# Próxima etapa — Gmail e base compartilhada
Provedor confirmado pelo usuário: Gmail. Integração ainda não implementada.

## Dependências
Confirmar se as contas são pessoais ou Google Workspace, endereços de Francislei/Junio/Carlos, conta remetente e e-mail principal.
Implementar backend autenticado, banco compartilhado e armazenamento protegido.
Criar projeto no Google Cloud, ativar Gmail API, configurar consentimento e cliente OAuth de aplicação web.
Registrar URLs HTTPS de retorno no domínio real. Não colocar client secret ou refresh tokens em variáveis VITE_ nem no frontend.
Obter consentimento individual, guardar tokens cifrados no servidor, permitir revogação e tratar expiração.
A leitura exige escopo adequado, como gmail.readonly; envio exige gmail.send. Escopos restritos podem demandar verificações adicionais conforme o cenário.
Implementar importação histórica em lotes, checkpoint, deduplicação, fila de revisão, reconciliação e fila de saída.
Só habilitar envio após validar endereço central, conteúdo e autorização.

## Documentação oficial
https://developers.google.com/workspace/gmail/api/auth/scopes
https://developers.google.com/identity/protocols/oauth2/web-server
https://vercel.com/docs/frameworks/frontend/vite

Consultadas em 23/09/2026. Não foram criadas credenciais nem acessadas mensagens durante esta entrega.
