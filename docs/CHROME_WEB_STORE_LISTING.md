# Tela Privada — Ficha de Publicação da Chrome Web Store

Este documento reúne todas as informações, textos oficiais, declarações técnicas e especificações visuais necessárias para a publicação e listagem da extensão **Tela Privada** na Google Chrome Web Store.

---

## 1. Identidade e Metadados Básicos

- **Nome da Extensão:** Tela Privada
- **Slogan / Tagline Oficial:** Proteção visual para WhatsApp Web
- **Versão:** 2.0.0
- **Manifest:** Manifest V3
- **Categoria da Loja:** Produtividade (*Productivity*) / Privacidade e Segurança (*Privacy & Security*)
- **Idioma Principal:** Português (Brasil) — `pt_BR`
- **Desenvolvedor e Proprietário:** Victor Ladislau Viana
- **Perfis Oficiais:**
  - **GitHub:** [https://github.com/Invictor13](https://github.com/Invictor13)
  - **LinkedIn:** [https://www.linkedin.com/in/victor-ladislau-14402a170/](https://www.linkedin.com/in/victor-ladislau-14402a170/)

---

## 2. Descrição Curta (Resumo na Loja)

> **Limite da Chrome Web Store:** até 132 caracteres.

```text
Proteção de privacidade visual para WhatsApp Web. Oculte mensagens, fotos e mídias em ambientes públicos ou compartilhados.
```
*(Tamanho: 122 caracteres)*

---

## 3. Descrição Detalhada (Corpo da Ficha da Loja)

```markdown
O Tela Privada é uma extensão leve e segura projetada para proteger a visualização da sua tela no WhatsApp Web contra olhares curiosos, transeuntes e colegas em ambientes corporativos, coworkings, cafés ou espaços compartilhados.

Com filtros CSS aplicados localmente e de maneira puramente visual, o Tela Privada permite que você mantenha conversas abertas com discrição e controle total sobre o que fica visível na tela.

--------------------------------------------------
PRINCIPAIS FUNCIONALIDADES
--------------------------------------------------

• Ocultação de Mensagens: Aplica efeito de desfoque (blur) sobre as mensagens do chat aberto.
• Ocultação de Prévias: Oculta as últimas mensagens e prévias na lista lateral de conversas.
• Ocultação de Mídias e Documentos: Desfoca fotos, vídeos, figurinhas, áudios e anexos compartilhados tanto na conversa quanto no painel de detalhes do contato/grupo.
• Ocultação de Fotos e Avatares: Oculta as fotos de perfil de contatos e grupos para preservar a identidade dos seus interlocutores.
• Ocultação de Nomes: Desfoca os nomes e números de telefone dos contatos e grupos na lista lateral e no topo da conversa.
• Predefinições Rápidas (Presets):
  - Básico: Oculta mensagens e prévias.
  - Avançado (Padrão): Oculta mensagens, prévias e mídias compartilhadas.
  - Máximo: Oculta mensagens, prévias, mídias, fotos e nomes.
• Modo Pânico / Emergência (Atalho Alt + Q): Ativa instantaneamente o nível de Proteção Máxima com um toque de teclado. Pressione novamente o atalho para restaurar os filtros anteriores.
• Efeito Visual de Partículas: Animação sutil de fundo opcional renderizada em Canvas, otimizada para pausar quando a aba estiver oculta.
• Revelação sob Demanda (Hover): Passe o cursor do mouse sobre o conteúdo desfocado para revelar pontualmente aquilo que você precisa ler.

--------------------------------------------------
COMO UTILIZAR
--------------------------------------------------

1. Abra o WhatsApp Web no navegador (web.whatsapp.com).
2. Clique no ícone do Tela Privada na barra de extensões do Chrome para abrir o painel popup.
3. Escolha uma das predefinições prontas (Básico, Avançado, Máximo) ou ajuste os interruptores conforme a sua necessidade.
4. Para emergências visuais instantâneas, utilize o atalho de teclado: Alt + Q.

--------------------------------------------------
PLATAFORMA ATUALMENTE SUPORTADA
--------------------------------------------------

• Exclusivamente WhatsApp Web (https://web.whatsapp.com/*).

Avisos sobre expansões futuras:
Integrações com outras ferramentas (como Microsoft Teams ou outros comunicadores web) são possibilidades futuras em estudo de viabilidade técnica e arquitetural. A versão atual NÃO possui compatibilidade ou suporte implementado com serviços fora do WhatsApp Web.

--------------------------------------------------
PRIVACIDADE, SEGURANÇA E TRANSPARÊNCIA
--------------------------------------------------

• 100% Local: Todas as preferências são salvas exclusivamente no chrome.storage.local do seu navegador.
• Zero Telemetria: A extensão não coleta, não monitora, não armazena e não transmite nenhuma informação pessoal ou conteúdo de mensagens.
• Sem Conexões Externas: Nenhuma requisição de rede ou chamada a servidores de terceiros é realizada.
• Mínimo de Permissões: Utiliza unicamente a permissão "storage" para gravar suas preferências locais, além do recurso de atalho de teclado ("commands").

--------------------------------------------------
AVISO LEGAL E LIMITAÇÕES IMPORTANTES (DISCLAIMER)
--------------------------------------------------

• O Tela Privada é uma ferramenta estritamente de PROTEÇÃO VISUAL DE TELA através de estilo CSS local.
• NÃO equivale a criptografia e não adiciona camadas criptográficas além das nativas do WhatsApp.
• NÃO impede capturas de tela (screenshots), fotos tiradas por câmeras de celulares, gravações de tela ou softwares de espionagem instalados no sistema operacional.
• NÃO detecta, bloqueia ou remove spywares, keyloggers ou malwares.
• WhatsApp é uma marca registrada de Meta Platforms, Inc. Esta extensão é um projeto independente de Victor Ladislau Viana e não possui vínculo, afiliação, patrocínio ou endosso da Meta Platforms, Inc.
```

---

## 4. Declaração de Permissões e Uso de Dados (CWS Privacy Tab)

| Campo / Recurso no Manifest | Tipo de Recurso | Declaração / Justificativa Oficial |
| :--- | :--- | :--- |
| **Coleta de Dados do Usuário** | Política de Privacidade | Não coleta nenhum tipo de dado pessoal, identificador, histórico de navegação, conteúdo financeiro, mensagens ou localização (*Single Purpose: No data collected*). |
| **Permissão `storage`** | `permissions` | Permissão declarada no array `permissions` do `manifest.json`. Necessária para persistir localmente no dispositivo do usuário (via `chrome.storage.local`) as opções de filtro visual e preferências de interface selecionadas no popup. |
| **Atalho `commands` (`toggle-panic`)** | `commands` | Recurso de comandos do manifesto (chave `commands` no `manifest.json`, não é uma permissão da lista `permissions`). Permite registrar e escutar o atalho de teclado global de emergência (`Alt + Q`). |
| **Injeção em `https://web.whatsapp.com/*`** | `content_scripts.matches` | Declaração declarativa em `content_scripts` (não requer `host_permissions` no `manifest.json`). Necessária para injetar localmente os seletores CSS e scripts de proteção visual na aba oficial do WhatsApp Web. |
| **Uso de Código Remoto** | Conformidade MV3 | Não utiliza código remoto hospedado externamente. 100% dos scripts e folhas de estilo são locais empacotados na extensão, em conformidade estrita com o Manifest V3. |

---

## 5. Inventário de Capturas de Tela e Finalidades

As capturas reais e oficiais foram incorporadas em `assets/store/screenshots/`:

| Arquivo | Resolução Original | Proporção | Descrição / Finalidade |
| :--- | :--- | :--- | :--- |
| `01-painel-popup-controles.png` | 405 x 451 px | ~0.90:1 | Exibe a interface do popup da extensão: logo oficial, seletores de nível (Básico, Avançado, Máximo), interruptores de filtros individuais (Mensagens, Fotos, Nomes, Mídias, Prévias), efeito de partículas e lembrete do atalho de emergência (Alt + Q). |
| `02-whatsapp-web-mensagens-ocultas.png` | 1780 x 978 px | ~1.82:1 | Demonstra a aplicação prática do desfoque visual sobre mensagens e prévias na interface do WhatsApp Web, garantindo privacidade em conversas abertas. |
| `03-whatsapp-web-painel-integrado.png` | 1785 x 1002 px | ~1.78:1 | Demonstra a usabilidade do popup aberto diretamente sobre a janela do WhatsApp Web com a lista de predefinições e opções interativas. |
| `04-whatsapp-web-protecao-completa-midia-fotos.png` | 1852 x 978 px | ~1.89:1 | Demonstra a tela completa com o nível Máximo ativado: mensagens, fotos de perfil, nomes e mídias compartilhadas plenamente desfocadas. |

### Registro de Limitações Técnicas das Capturas de Tela
- **Resolução e Proporção:** A Chrome Web Store recomenda capturas em resolução padrão de 1280x800 ou 640x400 (proporção 16:10). As capturas fornecidas são extraídas de telas reais em uso cotidiano (resoluções 405x451, 1780x978, 1785x1002 e 1852x978).
- **Diretriz de Fidelidade:** Em cumprimento à diretriz estrita de preservação do projeto de não recriar, adulterar, redimensionar artificialmente ou simular telas, os arquivos originais foram mantidos em seus formatos nativos.
- **Ação para Envio:** No momento do upload no painel do Chrome Web Store Developer Dashboard, caso o validador automático da loja exija obrigatoriamente a resolução exata de 1280x800 px, o responsável pelo projeto deverá realizar o enquadramento ou letterboxing sem distorção das capturas reais.
