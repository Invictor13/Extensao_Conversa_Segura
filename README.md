# Tela Privada — Proteção visual para WhatsApp Web

Extensão de navegador (Manifest V3) desenvolvida para oferecer proteção visual e privacidade de tela ao utilizar o WhatsApp Web (`web.whatsapp.com`), mitigando a exposição indevida de dados contra olhares curiosos (*shoulder surfing*) em ambientes públicos, corporativos, coworkings ou espaços compartilhados.

**Versão declarada no código:** `2.0.3` (Manifest V3)
**Status de publicação:** Em processo de preparação e submissão para a Google Chrome Web Store e Microsoft Edge Add-ons.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Plataforma Suportada e Expansões Futuras](#plataforma-suportada-e-expansões-futuras)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Modos de Operação e Predefinições](#modos-de-operação-e-predefinições)
- [Atalho de Emergência (Modo Pânico)](#atalho-de-emergência-modo-pânico)
- [Censura Automática por Inatividade](#censura-automática-por-inatividade)
- [Revelação Temporária sob Demanda (Hover Reveal)](#revelação-temporária-sob-demanda-hover-reveal)
- [Internacionalização (i18n)](#internacionalização-i18n)
- [Privacidade, Permissões e Segurança](#privacidade-permissões-e-segurança)
- [Arquitetura de Software e Módulos](#arquitetura-de-software-e-módulos)
- [Capturas de Tela e Recursos Visuais](#capturas-de-tela-e-recursos-visuais)
- [Como Instalar e Executar Localmente](#como-instalar-e-executar-localmente)
- [Validação e Testes Automatizados](#validação-e-testes-automatizados)
- [Avisos Legais e Limitações (Disclaimer)](#avisos-legais-e-limitações-disclaimer)
- [Autoria e Propriedade](#autoria-e-propriedade)

---

## Visão Geral

O **Tela Privada** atua exclusivamente na camada de apresentação visual do navegador, aplicando regras de estilo CSS dinâmicas e isoladas sobre o DOM do WhatsApp Web.

A extensão foi projetada sob o princípio de **Privacidade por Padrão** (*Privacy by Default*):
- Não realiza leitura, cópia, transcrição ou interceptação do conteúdo de mensagens.
- Não efetua chamadas externas de rede, telemetria ou rastreamento analítico.
- Persiste todas as preferências do usuário estritamente na API local do navegador (`chrome.storage.local`).

---

## Plataforma Suportada e Expansões Futuras

### Plataforma Atualmente Suportada
- **WhatsApp Web (`https://web.whatsapp.com/*`)**

> **Aviso Importante de Escopo:** O suporte funcional e homologado desta extensão é **estritamente exclusivo para o WhatsApp Web**. Nenhuma outra plataforma de comunicação possui suporte funcional na versão atual.

### Expansões Futuras em Avaliação (Roadmap)
- **Microsoft Teams (Web)**
- **Outros comunicadores web**, sujeitos a avaliação de viabilidade técnica e arquitetural.

> **Nota:** As integrações mencionadas acima representam possibilidades de roadmap e **não estão implementadas nem disponíveis** na versão atual.

---

## Funcionalidades Principais

1. **Ocultação de Mensagens (`hideMessages`):** Aplica desfoque visual (*blur*) sobre o conteúdo textual de mensagens recebidas e enviadas no chat aberto.
2. **Ocultação de Prévias (`hidePreviews`):** Desfoca o texto de resumo da última mensagem exibido na lista lateral de conversas.
3. **Ocultação de Nomes de Contatos e Grupos (`hideNames`):** Desfoca nomes, títulos de conversas e números de telefone na barra lateral e no cabeçalho do chat, utilizando 19 seletores estritamente refinados para não interferir em botões de navegação, abas de filtro ou campos de pesquisa.
4. **Ocultação de Fotos e Avatares (`hidePhotos`):** Desfoca imagens de perfil e avatares de contatos e grupos na lista lateral e nos cabeçalhos.
5. **Ocultação de Mídias e Documentos (`hideMedia`):** Aplica censura visual sobre fotos compartilhadas, vídeos, animações GIF, figurinhas (*stickers*), mensagens de voz/áudio e thumbnails nos painéis de gaveta de perfil (Mídia, Links e Docs).
6. **Efeito Visual de Partículas (`particleEffect`):** Renderiza uma animação sutil em segundo plano através de Canvas HTML5. Pausa de forma automática quando a aba está em segundo plano ou caso o sistema indique preferência por movimento reduzido (`prefers-reduced-motion`).

---

## Modos de Operação e Predefinições

A extensão disponibiliza níveis rápidos de configuração pelo popup, permitindo alternar instantaneamente entre perfis de uso:

| Nível de Proteção | Mensagens | Prévias | Mídias/Docs | Nomes | Fotos/Avatares | Observação |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Básico** | ✅ Ativo | ✅ Ativo | ❌ Inativo | ❌ Inativo | ❌ Inativo | Recomendado para leitura rápida em ambientes de baixo risco. |
| **Avançado** *(Padrão)* | ✅ Ativo | ✅ Ativo | ✅ Ativo | ❌ Inativo | ❌ Inativo | Perfil padrão de instalação; oculta conteúdo de conversas e mídias mantendo identificação de contatos. |
| **Máximo** | ✅ Ativo | ✅ Ativo | ✅ Ativo | ✅ Ativo | ✅ Ativo | Anonimização visual completa de toda a interface. |
| **Personalizado** | Custom | Custom | Custom | Custom | Custom | Ativado automaticamente quando interruptores individuais são ajustados manualmente. |

---

## Atalho de Emergência (Modo Pânico)

- **Atalho Padrão:** `Alt + Q` (configurado via `commands` no `manifest.json`).
- **Comportamento Resiliente e Idempotente:**
  - Ao ser acionado, o atalho salva um *snapshot* seguro das configurações funcionais vigentes e força imediatamente o nível **Máximo** de proteção.
  - Ao ser pressionado novamente, o atalho restaura com exatidão o estado anterior à emergência.
  - O ciclo de emergência **nunca sobrescreve a preferência de idioma** configurada pelo usuário.
  - Caso o usuário altere manualmente qualquer filtro visual enquanto o Modo de Emergência estiver ativo, o snapshot é descartado com segurança e a extensão assume o novo estado solicitado.

---

## Censura Automática por Inatividade

Implementada para garantir proteção da tela quando o usuário se afasta temporariamente do computador:

- **Controle pelo Popup:** Permite ativar/desativar o recurso (`autoCensorEnabled`).
- **Tempo Limite Configurável:** Opções predefinidas (30s, 1 min, 2 min, 5 min) e modo personalizado entre 10 e 3600 segundos (`autoCensorTimeout`).
- **Efeitos Visuais Selecionáveis (`autoCensorEffect`):**
  - **Blur Intenso (`blur`):** Aplica desfoque severo sobre a tela inteira.
  - **Escurecimento (`darken`):** Aplica película escura sobre a visualização.
  - **Cobertura Opaca (`opaque`):** Oculta integralmente o conteúdo da janela com camada opaca.
- **Camada Não Invasiva:** Renderizada via overlay (`#vlv-auto-censor-overlay`) com `pointer-events: none` e alto índice z (`z-index: 999990`), garantindo que não haja interferência nas funcionalidades do WhatsApp Web.
- **Desbloqueio Imediato:** A camada é removida instantaneamente sem atraso ou latência diante de qualquer interação do usuário (movimentação de mouse, clique ou tecla pressionada).

---

## Revelação Temporária sob Demanda (Hover Reveal)

Permite visualizar informações censuradas sem precisar desativar filtros no popup:

- **Dispositivos com Cursor Fino:** Opera sob media query `@media (hover: hover) and (pointer: fine)`.
- **Mensagens e Mídias:** Posicionar o cursor sobre uma bolha de mensagem ou mídia censurada remove momentaneamente o desfoque daquele elemento específico.
- **Barra Lateral de Conversas (Smart Row Hover):** Ao passar o cursor sobre a linha de uma conversa na lista lateral, o nome do contato, a prévia da última mensagem e a foto de perfil daquela linha são revelados simultaneamente de forma coordenada, mantendo as demais conversas da lista devidamente protegidas e censuradas.

---

## Internacionalização (i18n)

A extensão dispõe de arquitetura completa de internacionalização:

- **Catálogos Nativos Manifest V3:** Estruturados em `_locales/pt_BR`, `_locales/en` e `_locales/es` para metadados da loja e descrições do manifesto.
- **Localização Dinâmica de Interface:** Módulo `src/core/i18n.js` que localiza labels, títulos, tooltips e atributos de acessibilidade (`aria-label`) em tempo de execução no popup.
- **Idiomas Suportados:**
  - 🇧🇷 Português do Brasil (`pt_BR`) — Idioma padrão de fábrica.
  - 🇺🇸 English (`en`).
  - 🇪🇸 Español (`es`).
- **Persistência Independente:** O idioma é salvo em `chrome.storage.local` e permanece inalterado por ciclos de emergência do Modo Pânico.

---

## Privacidade, Permissões e Segurança

A extensão opera com o conjunto mínimo de permissões necessárias:

| Recurso / Declaração | Tipo | Finalidade | Dados Acessados | Comunicação Externa |
| :--- | :--- | :--- | :--- | :--- |
| **`storage`** | `permissions` | Persistência local das preferências do usuário (`chrome.storage.local`). | Preferências booleanas, numéricas e de idioma. | **Zero (0)** |
| **`toggle-panic`** | `commands` | Registro do atalho global de teclado (`Alt + Q`). | Disparo de evento do teclado. | **Zero (0)** |
| **`https://web.whatsapp.com/*`** | `content_scripts.matches` | Injeção declarativa local de folhas de estilo e scripts de apresentação. | Estrutura de classes do DOM. | **Zero (0)** |

### Garantias de Privacidade
- **Sem `host_permissions`:** A extensão não solicita permissões amplas de hosts no manifesto.
- **Zero Telemetria e Analytics:** Não coleta histórico, métricas de uso, identificadores ou dados de conversas.
- **Zero Código Remoto:** 100% do código e das bibliotecas são locais e empacotados na extensão.
- **Sem Comunicação com Servidores Externos:** Nenhuma requisição (`fetch`, `XMLHttpRequest`, `WebSocket`) é disparada pela extensão.

---

## Arquitetura de Software e Módulos

O código está estruturado em módulos com separação clara de responsabilidades:

```text
├── _locales/                       # Catálogos oficiais de tradução nativa MV3 (pt_BR, en, es)
├── assets/store/screenshots/       # Capturas de tela e assets de divulgação
├── content/
│   ├── content.css                 # Folha de estilos e seletores CSS de censura e hover
│   └── content.js                  # Ponto de entrada de injeção na página do WhatsApp Web
├── docs/                           # Documentação de apoio, política de privacidade e checklists
├── icons/                          # Ícones oficiais da extensão (16px, 48px, 128px)
├── popup/
│   ├── logo.png                    # Logotipo oficial
│   ├── popup.html                  # Interface gráfica do popup
│   ├── popup.css                   # Folha de estilos do popup com rolagem compacta
│   └── popup.js                    # Controlador de eventos e sincronização do popup
├── src/
│   ├── core/
│   │   ├── i18n.js                 # Motor de tradução e internacionalização dinâmica
│   │   ├── settings-manager.js     # Gerenciamento de leitura, escrita atômica e sanitização
│   │   └── health-monitor.js       # Utilitário interno para verificação de integridade
│   └── engine/
│       ├── privacy-engine.js       # Controle do Modo Pânico e vigia de inatividade
│       ├── visual-engine.js        # Motor gráfico Canvas para efeito de partículas
│       └── whatsapp-integration.js  # Gerenciador de classes CSS e seletores do WhatsApp
├── test/
│   └── test-suite.js               # Suíte abrangente de testes automatizados unitários e de integração
├── background.js                   # Service Worker MV3 para tratamento de atalhos e ciclo de vida
└── manifest.json                   # Manifesto de configuração da extensão (v2.0.3)
```

---

## Capturas de Tela e Recursos Visuais

As capturas de tela oficiais da extensão estão localizadas em [`assets/store/screenshots/`](assets/store/screenshots/):

1. **`01-painel-popup-controles.png`**: Interface do popup com níveis de proteção e filtros manuais. *(Nota: captura legada pendente de atualização com as novas seções de Censura Automática e Idioma)*.
2. **`02-whatsapp-web-mensagens-ocultas.png`**: Interface do WhatsApp Web com desfoque aplicado sobre mensagens e prévias.
3. **`03-whatsapp-web-painel-integrado.png`**: Demonstração de uso conjunto da aplicação com o popup aberto sobre o WhatsApp Web. *(Nota: captura legada pendente de atualização)*.
4. **`04-whatsapp-web-protecao-completa-midia-fotos.png`**: Visualização com Proteção Máxima ativada, demonstrando a ocultação de mensagens, mídias, fotos de perfil e nomes.

> **Nota sobre Artefatos Legados no Repositório:** O arquivo `Extensao_Conversa_Segura-v2.0.2.zip` presente na raiz do repositório é um artefato legado correspondente à tag `V2.0.2` e não inclui as funcionalidades introduzidas nas PRs subsequentes da release 2.0.3. Para testes e empacotamento, utilize o código-fonte atual da branch.

---

## Como Instalar e Executar Localmente

### Google Chrome / Microsoft Edge / Brave
1. Clone ou baixe este repositório no seu computador.
2. Abra o navegador e acesse a página de gerenciamento de extensões:
   - No Chrome: `chrome://extensions/`
   - No Edge: `edge://extensions/`
3. Ative a chave **Modo do desenvolvedor** (*Developer mode*).
4. Clique no botão **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta raiz deste repositório (onde está o `manifest.json`).
6. Acesse [https://web.whatsapp.com/](https://web.whatsapp.com/) para utilizar a extensão.

---

## Validação e Testes Automatizados

O projeto conta com uma suíte abrangente de testes automatizados sem dependências externas pesadas, executada diretamente via Node.js:

```bash
node test/test-suite.js
```

A suíte cobre:
- Sanitização de esquemas e detecção de predefinições do `SettingsManager`.
- Avaliação de configurações efetivas e ciclo de vida do Modo Pânico (Alt+Q).
- Idempotência, tolerância a falhas e isolamento de idioma durante emergências.
- Ciclo de vida de instalação limpa e atualização em `background.js` (preservação de chaves existentes).
- Paridade estrita de seletores CSS (1:1) entre `content.css` e `whatsapp-integration.js`.
- Ocultação e isolamento de mídias, fotos e abas da gaveta lateral (Mídia, Links, Docs).
- Matriz de testes do Smart Hover Reveal em mensagens, mídias e linhas da sidebar.
- Sanitização, timeout e overlay da Censura Automática por Inatividade (PR04).
- Validação e integridade de catálogos e módulos de internacionalização (`i18n`).

---

## Avisos Legais e Limitações (Disclaimer)

O **Tela Privada** é uma ferramenta estritamente focada em **salvaguarda visual de tela** por estilização CSS local:
- **Não substitui a criptografia:** A extensão não adiciona nem altera os mecanismos criptográficos nativos da plataforma WhatsApp.
- **Não protege contra malwares:** Não detecta, não bloqueia e não remove malwares, spywares, vírus ou keyloggers instalados no sistema operacional.
- **Não impede capturas de tela externas:** Não previne screenshots ou gravações efetuadas pelo sistema operacional, nem fotos tiradas por câmeras ou dispositivos externos apontados para o monitor.
- **Isenção de Vínculo:** WhatsApp é marca registrada de Meta Platforms, Inc. Esta extensão é um projeto independente de código aberto desenvolvido por Victor Ladislau Viana e não possui vínculo, chancela, afiliação ou endosso da Meta Platforms, Inc.

---

## Autoria e Propriedade

Desenvolvido e de propriedade de **Victor Ladislau Viana**.

- **GitHub:** [https://github.com/Invictor13](https://github.com/Invictor13)
- **LinkedIn:** [https://www.linkedin.com/in/victor-ladislau-14402a170/](https://www.linkedin.com/in/victor-ladislau-14402a170/)
- **Repositório:** [https://github.com/Invictor13/Extensao_Conversa_Segura](https://github.com/Invictor13/Extensao_Conversa_Segura)
