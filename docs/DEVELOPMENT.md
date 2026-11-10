# Desenvolvimento e instalação local

Guia para preparar o ambiente, carregar a extensão localmente e executar as verificações disponíveis.

## Requisitos

- Google Chrome ou Microsoft Edge baseado em Chromium.
- Node.js para executar a suíte automatizada.
- Git, caso deseje clonar o repositório.

## Obter o código

```bash
git clone https://github.com/Invictor13/Extensao_Conversa_Segura.git
cd Extensao_Conversa_Segura
```

## Carregar a extensão no navegador

### Google Chrome

1. Acesse `chrome://extensions/`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta raiz do repositório, onde está o `manifest.json`.

### Microsoft Edge

1. Acesse `edge://extensions/`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta raiz do repositório.

Depois da instalação, abra [WhatsApp Web](https://web.whatsapp.com/) e teste os controles da extensão.

## Executar os testes

Na raiz do projeto:

```bash
node test/test-suite.js
```

Consulte [Testes e validação](TESTING.md) para conhecer a cobertura e a lista de verificações manuais recomendadas.

## Estrutura para orientação

- `manifest.json`: versão, permissões, popup, service worker e scripts de conteúdo.
- `background.js`: service worker do Manifest V3.
- `popup/`: interface de configuração.
- `src/core/`: configurações e internacionalização.
- `src/engine/`: motores de privacidade, integração e efeitos visuais.
- `content/`: entrada e estilos aplicados à página.
- `test/`: suíte automatizada.

Consulte [Arquitetura e módulos](ARCHITECTURE.md) antes de alterar responsabilidades entre componentes.

## Diretrizes para alterações

- Preserve o escopo funcional de integração com WhatsApp Web, salvo decisão explícita de produto.
- Mantenha as permissões do manifesto limitadas ao necessário e documente qualquer mudança.
- Não introduza telemetria, chamadas externas ou código remoto sem revisão explícita de privacidade e segurança.
- Atualize os testes quando alterar comportamentos existentes.
- Ao alterar seletores da interface, verifique a consistência entre CSS e os módulos de integração.
- Não inclua credenciais, tokens ou dados pessoais em commits.

## Empacotamento

Para distribuição, gere o pacote a partir dos arquivos de execução necessários e confira o conteúdo do ZIP antes do envio às lojas. Não reutilize o ZIP legado `Extensao_Conversa_Segura-v2.0.2.zip` como pacote da versão atual.
