# Testes e validação

Este documento registra como executar a suíte automatizada do Tela Privada e quais áreas ela cobre.

## Pré-requisito

- Node.js instalado no ambiente de desenvolvimento.

O projeto disponibiliza uma suíte executável diretamente, sem exigir um processo de build para rodá-la.

## Executar os testes

Na raiz do repositório, execute:

```bash
node test/test-suite.js
```

A execução deve ser feita após alterações relevantes no código, especialmente em configurações, seletores, integração com a página e ciclo de vida da extensão.

## Áreas cobertas

A suíte existente cobre, entre outros pontos:

- Sanitização das configurações e detecção dos níveis de proteção no `SettingsManager`.
- Avaliação das configurações efetivas e ciclo de vida do modo de emergência (`Alt + Q`).
- Idempotência, tolerância a falhas e preservação do idioma durante emergências.
- Instalação limpa e atualização no `background.js`, incluindo preservação de chaves existentes.
- Paridade entre seletores CSS declarados em `content.css` e os utilizados pela integração com o WhatsApp.
- Ocultação e isolamento visual de mídias, fotos e áreas da gaveta lateral (Mídia, Links e Docs).
- Comportamento do Hover Reveal em mensagens, mídias e linhas da lista lateral.
- Sanitização, temporização e overlay da censura automática por inatividade.
- Integridade dos catálogos e módulos de internacionalização.

## Validação manual recomendada

Além dos testes automatizados, valide no Chrome e no Edge:

1. Instalação local da extensão em uma versão atual do navegador.
2. Abertura do WhatsApp Web e carregamento dos controles.
3. Alternância entre Básico, Avançado, Máximo e Personalizado.
4. Ativação e restauração do modo de emergência pelo atalho.
5. Ocultação e revelação temporária de mensagens, nomes, fotos e mídias.
6. Censura por inatividade, incluindo tempo, efeito e desbloqueio.
7. Alteração de idioma e persistência das preferências após recarregar a página.

## Observações

- Os testes automatizados não substituem a validação manual em navegadores reais.
- A interface do WhatsApp Web pode mudar independentemente do projeto; regressões relacionadas ao DOM devem ser investigadas com atenção.
- Não declare uma execução como aprovada sem registrar o resultado efetivamente observado.
