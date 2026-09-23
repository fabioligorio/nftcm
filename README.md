# NFTCM — Molaço
MVP de central de notas fiscais e inteligência de compras. Desenvolvido pela FL Solution, Curitiba/PR.

## O que funciona
- Dashboard responsivo com gráficos de compras, origem, preços e recorrência.
- Demonstração isolada da base de trabalho.
- Importação em lote de XMLs de NF-e modelo 55, validação estrutural básica, chave com dígito verificador e bloqueio de entidades XML.
- Deduplicação por chave, preservação das origens e rejeição de conteúdo divergente.
- Revisão de compra, registro manual de cancelamento e exclusão dos indicadores.
- Catálogo, equivalência por fornecedor/código/unidade e fator de conversão.
- Comparações trimestrais e semestrais de períodos completos, média ponderada e ausência de base explícita.
- Filtros, exportação CSV protegida contra fórmulas, XML original e cópia JSON da base.
- Configurações da unidade, histórico local de alterações e rascunho de resumo em .eml.

## Limites desta versão
É um MVP local-first, não o sistema corporativo completo descrito no PRD.
Os XMLs e dados ficam em IndexedDB **neste navegador e nesta origem**. Não há banco compartilhado, login corporativo, perfis de acesso, sincronização, envio de e-mail ou conexão ativa ao Gmail.
O botão de rascunho apenas baixa um arquivo; não envia mensagem.
O estado fiscal atual e a assinatura não são verificados. Aprovação é conferência manual, não autorização fiscal.
PDF, ZIP, OCR, cotações atuais, restauração pela interface, consulta SEFAZ e integração ERP não estão implementados.
A chave é conferida matematicamente, mas isso não comprova autenticidade.
O histórico registra ações locais, sem identificação autenticada ou trilha imutável.

## Executar
Requer Node.js 22.12 ou superior.
```sh
npm ci
npm run dev
```
Abra http://127.0.0.1:5173. A aplicação começa na demonstração. Clique **Acessar minha base** para trabalhar com XMLs.
Em **Configurações**, informe CNPJ e UF. Importe XMLs, confira destinatário/natureza/CFOP e aprove as compras. Cadastre produtos e vincule itens para comparar preços.
Faça cópias regulares em Configurações; limpar dados do navegador remove a base local. Use um navegador de trabalho confiável.

## Validar
```sh
npm test
npm run build
npm run test:e2e
```
O teste de navegador exige servidor local ativo. No Windows usa Edge; em Linux, instale Chromium com npx playwright install chromium.
O teste usa um contexto isolado e dados sintéticos; não altera a base do usuário.

## Publicar na Vercel
Repositório: https://github.com/fabioligorio/nftcm
Importar na Vercel com Root Directory na raiz, framework Vite, build npm run build e saída dist. Nenhuma variável secreta é necessária para este MVP.
A configuração está em vercel.json. Apenas dist é publicado, não os documentos comerciais locais.
O endereço de produção e o de preview possuem bases locais distintas.
Consulte docs/MVP-ENTREGA.md e docs/GMAIL-PROXIMA-ETAPA.md.

## Estrutura
apps/web/src — aplicação React/TypeScript, domínio e persistência.
tests — regras de negócio e teste de ponta a ponta.
dist — saída gerada, ignorada no Git.
As demais pastas da especificação local não representam serviços em execução.
