# Arquitetura do Tela Privada

Este documento descreve a organização técnica da extensão e as responsabilidades dos principais módulos.

## Visão geral

O Tela Privada utiliza **Manifest V3** e atua sobre a interface do WhatsApp Web. A proteção é implementada na camada de apresentação, por meio de folhas de estilo e scripts locais que aplicam ou removem classes visuais nos elementos da página.

O fluxo geral é:

1. O navegador carrega o service worker definido no manifesto.
2. Ao abrir uma página compatível do WhatsApp Web, o navegador injeta os estilos e scripts declarados em `content_scripts`.
3. O gerenciador de configurações disponibiliza as preferências locais.
4. Os módulos de integração e privacidade aplicam os estados visuais correspondentes.
5. O popup permite ao usuário alterar filtros e preferências.

## Estrutura do repositório

```text
_locales/                       Catálogos de localização (pt_BR, en, es)
assets/store/screenshots/       Capturas reais para divulgação
content/
  content.css                   Regras visuais de proteção e revelação
  content.js                    Entrada do código executado na página
docs/                           Documentação do projeto
icons/                          Ícones da extensão
popup/
  popup.html                    Estrutura da interface
  popup.css                     Estilos do popup
  popup.js                      Eventos e sincronização da interface
src/
  core/
    i18n.js                     Internacionalização dinâmica
    settings-manager.js         Leitura, escrita e sanitização de preferências
    health-monitor.js           Verificações internas de integridade
  engine/
    privacy-engine.js           Ciclo de emergência e censura por inatividade
    visual-engine.js            Efeito visual de partículas
    whatsapp-integration.js     Integração com a interface do WhatsApp Web
test/
  test-suite.js                 Testes automatizados
background.js                   Service worker do Manifest V3
manifest.json                   Metadados, permissões e pontos de entrada
```

## Componentes e responsabilidades

### Manifesto e ciclo de vida

O `manifest.json` define Manifest V3, o service worker `background.js`, o popup, os ícones, a permissão `storage`, o comando `toggle-panic` e a injeção declarativa restrita a `https://web.whatsapp.com/*`.

### Popup

Os arquivos `popup/popup.html`, `popup/popup.css` e `popup/popup.js` compõem a interface de controle. O popup apresenta os níveis de proteção, filtros individuais e preferências disponíveis.

### Núcleo

- `settings-manager.js`: centraliza a leitura, a validação/sanitização e a persistência das preferências.
- `i18n.js`: aplica as traduções dinâmicas da interface.
- `health-monitor.js`: oferece verificações internas de integridade.

### Motores

- `whatsapp-integration.js`: conecta as preferências aos elementos da interface do WhatsApp Web.
- `privacy-engine.js`: coordena comportamentos de privacidade, incluindo o modo de emergência e a censura por inatividade.
- `visual-engine.js`: controla o efeito opcional de partículas.

### Camada de conteúdo

`content/content.js` é o ponto de entrada dos scripts executados na página, enquanto `content/content.css` contém os estilos que realizam os efeitos visuais.

## Preferências e armazenamento

As preferências são persistidas no armazenamento local do navegador por meio de `chrome.storage.local`. O conjunto inclui o nível de proteção, filtros visuais, idioma e opções de censura por inatividade.

A extensão não precisa de um serviço remoto para aplicar os efeitos visuais descritos neste projeto.

## Escopo de integração

A integração funcional atual é exclusiva do WhatsApp Web. O uso de seletores e estruturas do DOM é uma dependência da interface da plataforma; mudanças nessa interface podem exigir ajustes de compatibilidade.

## Limites de segurança

O Tela Privada reduz a exposição visual na tela. Não substitui criptografia, não impede capturas de tela ou fotografias externas e não protege o sistema operacional contra softwares maliciosos.
