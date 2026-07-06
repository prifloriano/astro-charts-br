# Política de segurança

## Como reportar

Não publique vulnerabilidades em issues abertas.

Prefira o recurso **Private vulnerability reporting** do GitHub, quando
disponível no repositório. Caso ele ainda não esteja habilitado, entre em
contato com a mantenedora por um canal privado indicado no perfil do projeto.

Inclua:

- versão afetada;
- impacto observado;
- passos mínimos para reproduzir;
- sugestão de correção, se houver;
- prazo razoável antes de qualquer divulgação pública.

## Escopo

São especialmente relevantes falhas que permitam execução de código inesperada,
injeção de conteúdo ou vazamento de dados do app consumidor.

A biblioteca não recebe credenciais nem chama APIs. Tokens, chaves e dados
sensíveis devem permanecer no app consumidor.

## Versões

Enquanto o pacote estiver em versão `0.x`, correções de segurança serão
publicadas na versão menor mais recente sempre que possível.
