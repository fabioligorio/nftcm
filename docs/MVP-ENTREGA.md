# Entrega do MVP
## Arquitetura efetivamente implementada
React + TypeScript + Vite com armazenamento IndexedDB via idb-keyval. Hospedagem estática na Vercel. Essa decisão permite entregar uma aplicação utilizável sem receber documentos fiscais em servidor público antes de existir autenticação.
Não há backend nem credenciais de Gmail embutidas. As três contas aparecem como não conectadas.

## Contrato dos indicadores
Total de compras: soma do valor total de NF-e nacional aprovada. Pendentes, canceladas, exterior e fora de escopo não participam.
Preço de produto: soma de vProd menos vDesc por item dividido pela quantidade convertida. Não representa custo de aquisição com tributos/frete.
Recorrência: número de notas distintas por produto. Linhas repetidas não elevam a contagem.
Trimestre e semestre: dois períodos completos anteriores à data de referência. Sem quantidade ou denominador zero resulta em sem base.
A comparação histórica considera o filtro de operação e o produto selecionado, independentemente das datas do filtro geral; esse comportamento é indicado na tela.
Equivalência: aprovação manual aplicada aos itens já importados com mesmo fornecedor, código e unidade. Novas importações exigem associação; não há regra persistente separada do histórico ainda.
Alterar CNPJ não reaprova automaticamente notas existentes. A revisão verifica o CNPJ atual antes de aprovar.

## Uso responsável
Nenhum dado real faz parte da demonstração. XMLs importados permanecem no navegador e entram pendentes.
Para usar como sistema compartilhado da empresa, é necessário implementar autenticação, autorização no servidor, banco e armazenamento protegidos, backups centralizados, integração Gmail e monitoramento.
Exportação JSON permite guardar cópia integral, mas a restauração via UI não está implementada. Não use este MVP como único arquivo fiscal.
O ambiente público exibe apenas dados sintéticos até o usuário importar documentos no próprio dispositivo.

## Testes
12 testes automatizados de importação, duplicidade, conflitos, cálculo e CSV.
Teste de navegador: dashboard, fornecedores, comparação trimestral, configuração, importação XML, duplicidade entre origens, aprovação, produto e equivalência, persistência após recarga, cancelamento e navegação mobile.
Build de produção e auditoria npm concluídos; repetir ao alterar dependências.
