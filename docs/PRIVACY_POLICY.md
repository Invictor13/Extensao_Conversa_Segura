# Política de Privacidade — Tela Privada

**Última atualização:** 26 de fevereiro de 2025
**Versão do documento:** 2.0.0
**Status de publicação:** Documento oficial preparado para publicação pública (ex.: GitHub Pages)

---

## 1. Identificação e Responsável

A extensão **Tela Privada** (anteriormente referenciada internamente como Privacy Pro) é um projeto de software livre/código aberto desenvolvido de forma independente e mantido por:

- **Responsável e Desenvolvedor:** Victor Ladislau Viana
- **Perfil no GitHub:** [https://github.com/Invictor13](https://github.com/Invictor13)
- **Perfil no LinkedIn:** [https://www.linkedin.com/in/victor-ladislau-14402a170/](https://www.linkedin.com/in/victor-ladislau-14402a170/)
- **Repositório do Código-Fonte:** [https://github.com/Invictor13/Extensao_Conversa_Segura](https://github.com/Invictor13/Extensao_Conversa_Segura)

---

## 2. Finalidade da Extensão

A **Tela Privada** tem como finalidade estrita e exclusiva oferecer **proteção visual de tela** para usuários do WhatsApp Web (`web.whatsapp.com`). Seu objetivo prático é mitigar o risco de leitura indiscreta por pessoas ao redor (conhecido como *shoulder surfing*) em ambientes públicos, compartilhados, coworkings ou escritórios corporativos, mediante aplicação local de estilos CSS que desfocam elementos gráficos e textuais da interface.

---

## 3. Dados Acessados e Processados

A extensão foi projetada sob o princípio de Privacidade por Padrão (*Privacy by Default*) e Minimização de Dados:

1. **Conteúdo de Mensagens:** A extensão **NÃO lê, NÃO extrai, NÃO copia, NÃO analisa e NÃO processa** o texto, áudio, anexo ou conteúdo de nenhuma mensagem trocada no WhatsApp Web.
2. **Dados Pessoais e de Contatos:** A extensão **NÃO coleta, NÃO armazena e NÃO transmite** nomes, números de telefone, fotos de perfil, histórico de conversas, lista de contatos ou qualquer metadado de comunicação.
3. **Dados de Navegação:** A extensão **NÃO monitora, NÃO registra e NÃO acessa** histórico de navegação, abas não relacionadas, cookies, credenciais de autenticação ou tokens de sessão.
4. **Manipulação do DOM:** A interação com a página do WhatsApp Web restringe-se estritamente à consulta de classes e nós estruturais do DOM para aplicação/remoção de classes CSS locais (ex.: `vlv-hide-messages`, `vlv-hide-previews`, `vlv-hide-names`, `vlv-hide-photos`, `vlv-hide-media`).

---

## 4. Uso do Armazenamento Local (`chrome.storage.local`)

Toda e qualquer persistência de dados ocorre exclusivamente no dispositivo do próprio usuário por meio da API `chrome.storage.local` do navegador.

### Dados estritamente armazenados:
- `protectionLevel`: Nível de proteção ativo (`"basic"`, `"advanced"`, `"maximum"` ou `"custom"`).
- `hideMessages`: Booleano para desfoque de mensagens no chat aberto (`true` ou `false`).
- `hidePreviews`: Booleano para desfoque das prévias de mensagem na barra lateral (`true` ou `false`).
- `hideNames`: Booleano para desfoque de nomes de contatos e grupos (`true` ou `false`).
- `hidePhotos`: Booleano para desfoque de fotos de perfil e avatares (`true` ou `false`).
- `hideMedia`: Booleano para desfoque de imagens, vídeos e anexos (`true` ou `false`).
- `particleEffect`: Booleano para ativação/desativação da animação Canvas de partículas (`true` ou `false`).
- `panicTriggered`: Booleano indicador do estado do Modo de Emergência (`true` ou `false`).
- `panicBackupSettings`: Objeto temporário de snapshot contendo as preferências anteriores para restauração após saída do Modo de Emergência, ou `null`.
- `lastUpdated`: Timestamp numérico (`Date.now()`) indicando a data/hora da última alteração de configuração no dispositivo.

Nenhum dado pessoal, texto de conversas ou informações sensíveis são gravados no armazenamento local.

---

## 5. Comunicação Externa, Telemetria e Analytics

- **Zero Comunicação Externa:** A extensão **NÃO realiza chamadas de rede** (`fetch`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon` ou similares).
- **Zero Telemetria ou Rastreamento:** A extensão não incorpora ferramentas de analytics (Google Analytics, Mixpanel, etc.), rastreadores de publicidade ou telemetria de uso.
- **Zero Código Remoto:** Nenhum script, folha de estilos ou biblioteca externa é baixado em tempo de execução. 100% do código executado está empacotado localmente na extensão, em plena conformidade com as diretrizes do Manifest V3 da Google Chrome Web Store.

---

## 6. Permissões do Navegador Declaradas

O manifesto da extensão (`manifest.json`) declara o conjunto estritamente mínimo e indispensável para seu funcionamento:

1. **`permissions: ["storage"]`**
   - **Justificativa:** Necessária para permitir que o usuário salve suas opções de filtro visual e preferências no painel popup entre sessões de navegação, via `chrome.storage.local`.
2. **`content_scripts` no domínio `https://web.whatsapp.com/*`**
   - **Justificativa:** Declaração necessária para injetar localmente a folha de estilos (`content.css`) e os scripts de controle de exibição na aba oficial do WhatsApp Web.
   - *Nota Técnica de Conformidade:* A extensão **não utiliza** nem declara `host_permissions` amplas ou opcionais no manifesto. A injeção ocorre exclusivamente de forma declarativa via `content_scripts.matches`.
3. **`commands` (`toggle-panic` / `Alt+Q`)**
   - **Justificativa:** Recurso de atalho de teclado global do navegador para permitir que o usuário ative instantaneamente a Proteção Máxima em situações de emergência visual sem precisar clicar no ícone da extensão.

---

## 7. Escopo e Limitações da Plataforma

- **Plataforma Atualmente Suportada:** A extensão funciona **exclusivamente no WhatsApp Web** (`https://web.whatsapp.com/*`).
- **Outras Ferramentas e Expansões Futuras:** Integrações com outras ferramentas (como Microsoft Teams, Slack ou outros comunicadores web) são possibilidades conceituais futuras que dependem de estudos de viabilidade técnica. **Na versão atual, NÃO há suporte nem funcionalidade implementada para qualquer serviço fora do WhatsApp Web.**

---

## 8. Limitações Técnicas e Avisos de Segurança

A **Tela Privada** é uma salvaguarda contra observação casual e não substitui medidas abrangentes de segurança da informação:

1. **Natureza Estritamente Visual:** A proteção opera mediante classes e propriedades CSS no navegador local (efeito de desfoque/blur e revelação sob o cursor do mouse).
2. **Não é Criptografia:** A extensão não adiciona nem altera a camada criptográfica das comunicações, a qual permanece regida exclusivamente pelo protocolo do WhatsApp.
3. **Não Impede Softwares Locais:** A extensão não impede capturas de tela (*screenshots*), gravações de tela pelo sistema operacional ou fotos tiradas com aparelhos externos (como câmeras de celulares).
4. **Não Protege contra Malwares:** A extensão não detecta, não bloqueia e não remove malwares, vírus, cavalos de troia, *keyloggers* ou *spywares* instalados no computador do usuário.

---

## 9. Alterações nesta Política

Esta Política de Privacidade poderá ser atualizada futuramente para refletir melhorias no produto ou adequações legais. Qualquer revisão será documentada de forma transparente no repositório oficial do projeto com a devida atualização do número de versão e data.

---

## 10. Canal de Contato

Para dúvidas, sugestões ou esclarecimentos sobre esta política e o tratamento de dados no projeto, entre em contato com o responsável:

- **Desenvolvedor:** Victor Ladislau Viana
- **GitHub Issues:** [https://github.com/Invictor13/Extensao_Conversa_Segura/issues](https://github.com/Invictor13/Extensao_Conversa_Segura/issues)
- **LinkedIn:** [https://www.linkedin.com/in/victor-ladislau-14402a170/](https://www.linkedin.com/in/victor-ladislau-14402a170/)
