# Tela Privada — Proteção visual para WhatsApp Web

Extensão de navegador (Manifest V3) para WhatsApp Web (`web.whatsapp.com`), projetada para oferecer proteção de privacidade visual e de tela contra olhares curiosos e espectadores em ambientes compartilhados.

---

## Autoria & Propriedade

Desenvolvido e de propriedade de **Victor Ladislau Viana**.

- **GitHub:** [https://github.com/Invictor13](https://github.com/Invictor13)
- **LinkedIn:** [https://www.linkedin.com/in/victor-ladislau-14402a170/](https://www.linkedin.com/in/victor-ladislau-14402a170/)

---

## Aviso Importante sobre Escopo e Limitações (Disclaimer)

O **Tela Privada** é uma ferramenta estritamente focada em **proteção visual de tela** via CSS local:
- **Não fornece criptografia adicional** além da já oferecida pela própria plataforma WhatsApp.
- **Não detecta nem remove spywares, malwares ou softwares maliciosos**.
- **Não impede capturas de tela (screenshots) nem gravações** realizadas pelo sistema operacional ou por softwares instalados no dispositivo.
- **Não realiza extração nem monitoramento** de dados ou mensagens dos usuários. Toda a operação é executada localmente no navegador, sem telemetria nem comunicação externa.

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

## Resumo de Privacidade & Permissões

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
