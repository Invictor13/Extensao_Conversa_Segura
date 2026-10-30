# UNIMED PRIVACY PRO — Documentação & Relatório de Segurança Corporativa

## Visão Geral
O **UNIMED PRIVACY PRO** é uma extensão de navegador de alto nível para o WhatsApp Web (`web.whatsapp.com`), projetada sob medida para ambientes corporativos que exigem rigorosos padrões de segurança da informação (SecOps) e conformidade com a Lei Geral de Proteção de Dados (LGPD).

---

## Módulos e Arquitetura

1. **`src/core/settings-manager.js`**
   - **Função:** Gerencia a leitura, gravação, validação de esquema e estados de fallback.
   - **Armazenamento:** Estritamente `chrome.storage.local` (sem sincronização externa).

2. **`src/engine/whatsapp-integration.js`**
   - **Função:** Centraliza seletores CSS resilientes e seguros para ocultação de mensagens, fotos, nomes, mídias e prévias no WhatsApp Web.
   - **Princípio:** Consulta o DOM apenas para aplicação de classes visuais. **Zero extração ou leitura de mensagens**.

3. **`src/engine/privacy-engine.js`**
   - **Função:** Gerencia o atalho de emergência e avalia as configurações ativas de proteção visual.

4. **`src/engine/visual-engine.js`**
   - **Função:** Renderiza o efeito opcional de partículas Canvas.
   - **Desempenho:** Pausa automaticamente quando a aba fica oculta ou se o usuário ativa `prefers-reduced-motion`.

5. **`src/core/health-monitor.js`**
   - **Função:** Painel técnico de diagnóstico exibido no popup para confirmar integridade do armazenamento e da extensão.

6. **`background.js` (Service Worker)**
   - **Função:** Ouve o atalho de emergência **Alt + Q** (`chrome.commands`) e força imediatamente a **Proteção Máxima**.

---

## Matriz de Conformidade Corporativa & Risco

| Módulo | Finalidade | Permissões | Dados Acessados | Comunicação Externa | Risco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Settings Manager** | Armazenamento de preferências | `storage` | Preferências locais booleans/numbers | **Zero (0)** | 🟢 Baixo |
| **WhatsApp Integration** | Seletores CSS de tela | Nenhum | Estrutura de classes DOM (visual) | **Zero (0)** | 🟢 Baixo |
| **Privacy Engine** | Modo Pânico/Emergência | Nenhum | Eventos de atalho local | **Zero (0)** | 🟢 Baixo |
| **Visual Engine** | Partículas & Animação | Nenhum | Tamanho da janela | **Zero (0)** | 🟢 Baixo |
| **Health Monitor** | Diagnóstico no popup | `storage` | Flags técnicas de estado | **Zero (0)** | 🟢 Baixo |

---

## Atalhos e Instalação
- **Atalho de Emergência:** `Alt + Q` (Ativa Proteção Máxima instantaneamente).
- **Instalação Local no Chrome:**
  1. Acesse `chrome://extensions/`.
  2. Ative o **Modo do desenvolvedor** no canto superior direito.
  3. Clique em **Carregar sem compactação** e selecione a pasta raiz da extensão.
