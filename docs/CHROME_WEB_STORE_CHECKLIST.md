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
- [x] **Versão do Projeto:** Definida como `1.0.0` no `manifest.json`.
- [x] **Permissões Mínimas Necessárias:** Apenas `"storage"` declarada em `permissions`, `"commands"` para o atalho de teclado e `"https://web.whatsapp.com/*"` em `host_permissions`.
- [x] **Ausência de Código Remoto:** Nenhum script externo ou CDN é carregado; todas as dependências são 100% locais e empacotadas.
- [x] **Testes Automatizados:** Suíte de testes passando com 100% de sucesso (`node test/test-suite.js`).

### 2. Assets Visuais e Ícones
- [x] **Ícones da Extensão:**
  - `icons/icon16.png` (16x16 px) — Ícone de favicon/barra de abas.
  - `icons/icon48.png` (48x48 px) — Ícone de gerenciamento de extensões.
  - `icons/icon128.png` (128x128 px) — Ícone oficial para a página da loja e instalação.
- [x] **Logo da Interface Popup:**
  - `popup/logo.png` (256x256 px) — Exibido no cabeçalho do popup.
- [x] **Capturas de Tela Oficiais Incorporadas:**
  - `assets/store/screenshots/01-painel-popup-controles.png` (405 x 451 px)
  - `assets/store/screenshots/02-whatsapp-web-mensagens-ocultas.png` (1780 x 978 px)
  - `assets/store/screenshots/03-whatsapp-web-painel-integrado.png` (1785 x 1002 px)
  - `assets/store/screenshots/04-whatsapp-web-protecao-completa-midia-fotos.png` (1852 x 978 px)
- [ ] **Ajuste de Resolução das Capturas (se exigido pela loja):**
  - *Evidência / Limitação Registrada:* A Chrome Web Store recomenda resolução de 1280x800 px ou 640x400 px (16:10). As capturas atuais são telas reais em alta fidelidade. Caso o formulário da loja rejeite o upload das dimensões originais, o responsável deverá aplicar letterboxing/moldura padrão 1280x800 sem distorção das capturas.
- [ ] **Imagem Promocional (Marquee / Small Tile) (Opcional na CWS):**
  - Small Tile: 440 x 280 px (opcional, exigido apenas se desejar destaque na loja).
  - Marquee: 1400 x 560 px (opcional).

### 3. Textos da Loja e Documentação
- [x] **Nome Oficial:** `Tela Privada`.
- [x] **Slogan / Tagline Oficial:** `Proteção visual para WhatsApp Web`.
- [x] **Descrição Curta:** Elaborada e conferida com 122 caracteres (limite máximo de 132 caracteres).
- [x] **Descrição Detalhada:** Documentada integralmente em `docs/CHROME_WEB_STORE_LISTING.md`.
- [x] **Instruções de Uso:** Documentadas passo a passo.
- [x] **Delimitação de Escopo:** Exclusividade do WhatsApp Web explícita no README.md e no listing; Microsoft Teams citado como possibilidade futura de roadmap não implementada.
- [x] **Limitações e Avisos Legais:** Explicitação de que se trata de proteção visual e não criptografia, e aviso de que não bloqueia gravações de tela externas.

### 4. Privacidade e Declarações do Desenvolvedor
- [x] **Declaração de Coleta de Dados:** O projeto não coleta nenhum dado do usuário (*Single Purpose* declarada).
- [x] **Justificativas de Permissões:**
  - `storage`: Gravar preferências de filtros do usuário.
  - `commands`: Registrar o atalho `Alt + Q` (Modo Pânico).
  - `host_permissions` (`web.whatsapp.com`): Injetar os seletores visuais CSS.
- [ ] **URL da Política de Privacidade Pública:**
  - Como a extensão utiliza `host_permissions` e manipulação de abas, a política da Chrome Web Store exige informar uma URL pública para a Política de Privacidade na aba de Privacidade do desenvolvedor.
  - *Pendência:* O responsável deve disponibilizar a política em página web acessível (ex: GitHub Pages ou gist público do repositório).

### 5. Empacotamento e Submissão
- [ ] **Geração do Pacote ZIP Final:**
  - Empacotar apenas os arquivos de produção (excluir arquivos de testes, documentação interna e arquivos temporários da raiz do ZIP):
    - `manifest.json`
    - `background.js`
    - `content/`
    - `popup/`
    - `icons/`
    - `src/`
  - Comando sugerido:
    ```bash
    zip -r tela-privada-v1.0.0.zip manifest.json background.js content/ popup/ icons/ src/
    ```
- [ ] **Conta de Desenvolvedor no Chrome Web Store:**
  - Acessar o [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
  - Pagar taxa única de registro do Google ($5 USD), caso ainda não tenha conta ativa.
  - Carregar o arquivo ZIP, preencher a ficha com base em `docs/CHROME_WEB_STORE_LISTING.md` e submeter para revisão.
