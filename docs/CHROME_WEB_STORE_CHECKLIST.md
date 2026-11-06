# Tela Privada — Checklist de Preparação para a Chrome Web Store

Este checklist consolida todos os itens técnicos, visuais e documentais necessários para a publicação da extensão **Tela Privada** no Google Chrome Web Store Developer Dashboard.

---

## Status dos Requisitos de Publicação

Legenda de Status:
- [x] **Concluído / Validado**: Item verificado e pronto no repositório.
- [ ] **Pendente de Ação do Responsável / Dashboard**: Ação administrativa externa a ser realizada no painel do desenvolvedor da Google.

---

### 1. Manifesto e Estrutura Técnica
- [x] **Manifest V3:** O arquivo `manifest.json` está em conformidade estrita com a especificação Manifest V3.
- [x] **Versão do Projeto:** Definida como `2.0.0` no `manifest.json` e sincronizada em toda a documentação.
- [x] **Permissões Mínimas Necessárias:** Apenas `"storage"` declarada em `permissions`, recurso `"commands"` para o atalho de teclado `Alt + Q` e injeção declarativa em `content_scripts.matches` (`https://web.whatsapp.com/*`). Zero uso de `host_permissions`.
- [x] **Ausência de Código Remoto:** Nenhum script externo ou CDN é carregado; todas as dependências são 100% locais e empacotadas.
- [x] **Testes Automatizados:** Suíte de testes passando com 100% de sucesso (`node test/test-suite.js`).

---

## Estrutura Operacional por Natureza da Ação

### Categoria A — Concluído e Validado no Código e Repositório
- [x] **Manifest V3 Validado:** `manifest.json` estruturado estritamente em Manifest V3 com versão `2.0.0`.
- [x] **Inventário de Permissões Auditado:**
  - `permissions`: Apenas `storage` (sem excessos).
  - `commands`: `toggle-panic` mapeado para `Alt+Q`.
  - `content_scripts`: Escopo restrito a `https://web.whatsapp.com/*`.
  - `host_permissions`: Nenhuma permissão declarada ou solicitada.
- [x] **Auditoria de Código Limpo:** Ausência confirmada de telemetria, analytics, rastreamento, código remoto ou chamadas de rede externas (`fetch`, `XMLHttpRequest`, `WebSocket`).
- [x] **Isolamento de Dados:** Armazenamento estritamente local (`chrome.storage.local`) de preferências visuais; zero leitura, extração ou gravação de conteúdo de mensagens.
- [x] **Assets de Identidade Visual:**
  - `icons/icon16.png` (16x16 px)
  - `icons/icon48.png` (48x48 px)
  - `icons/icon128.png` (128x128 px)
  - `popup/logo.png` (256x256 px)
- [x] **Capturas de Tela Oficiais Incorporadas:**
  - `assets/store/screenshots/01-painel-popup-controles.png` (405 x 451 px)
  - `assets/store/screenshots/02-whatsapp-web-mensagens-ocultas.png` (1780 x 978 px)
  - `assets/store/screenshots/03-whatsapp-web-painel-integrado.png` (1785 x 1002 px)
  - `assets/store/screenshots/04-whatsapp-web-protecao-completa-midia-fotos.png` (1852 x 978 px)
- [x] **Textos Oficiais da Loja:** Ficha completa documentada em `docs/CHROME_WEB_STORE_LISTING.md` (resumo de 122 caracteres, descrição detalhada, avisos legais e disclaimers).
- [x] **Testes Automatizados:** Suíte de regressão passando com 100% de integridade (`node test/test-suite.js`).

### Categoria B — Documento Preparado, mas Pendente de Publicação
- [ ] **Publicação da Política de Privacidade na Web:**
  - *Status:* Documento oficial elaborado e auditado em `docs/PRIVACY_POLICY.md` (versão 2.0.0).
  - *Ação necessária:* Publicar o conteúdo em uma URL pública acessível (por exemplo, via GitHub Pages no repositório ou página institucional) para preenchimento obrigatório na ficha da Chrome Web Store.
  - *Responsável:* Victor Ladislau Viana.

### Categoria C — Ação Manual Necessária no Developer Dashboard
- [ ] **Geração do Arquivo ZIP de Distribuição:**
  - Gerar o pacote limpo contendo apenas os artefatos de execução:
    ```bash
    zip -r tela-privada-v2.0.0.zip manifest.json background.js content/ popup/ icons/ src/
    ```
- [ ] **Conta de Desenvolvedor Chrome Web Store:**
  - Acessar o [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
  - Confirmar registro ativo com autenticação em duas etapas (2FA) configurada.
- [ ] **Preenchimento dos Campos da Ficha da Loja:**
  - Preencher título, resumo curto (122 caracteres), descrição longa, categoria (Produtividade / Privacidade) e idioma com base em `docs/CHROME_WEB_STORE_LISTING.md`.
- [ ] **Preenchimento da Aba de Privacidade (Privacy Tab):**
  - Inserir a URL pública da Política de Privacidade (Categoria B).
  - Declarar finalidade única (*Single Purpose: Screen visual privacy for WhatsApp Web*).
  - Declarar que a extensão **não coleta dados de usuários** (*No user data collected*).
  - Justificar a permissão `storage` conforme `docs/CHROME_WEB_STORE_LISTING.md`.
- [ ] **Upload dos Screenshots e Enquadramento:**
  - Carregar as 4 capturas de tela oficiais (`assets/store/screenshots/`).
  - *Observação técnica:* Caso o validador de formulário do dashboard exija estritamente a proporção 16:10 ou resolução padrão (1280x800 ou 640x400 px), aplicar moldura neutra (letterbox) mantendo as imagens reais inalteradas.
- [ ] **Imagens Promocionais (Opcional):**
  - Caso deseje destaque promocional na vitrine da loja: carregar Small Tile (440x280 px) e/ou Marquee (1400x560 px).
- [ ] **Submissão Formal do Pacote:**
  - Clicar no botão "Submit for Review" (Enviar para revisão) no painel.

### Categoria D — Item Dependente de Confirmação do Google
- [ ] **Revisão e Aprovação da Chrome Web Store:**
  - Aguardar o processo de análise automatizada e humana do time de segurança da Google Chrome Web Store.
- [ ] **Disponibilização Pública na Loja:**
  - Confirmação de publicação ativa com geração de URL pública na Chrome Web Store para download e instalação pelos usuários.
