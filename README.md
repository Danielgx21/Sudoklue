# Sudoklue

Jogo de lógica e investigação com monstrinhos. A tela principal usa a arte ilustrada original. O jogo funciona localmente no aplicativo Android, sem iniciar um servidor no Render.

## Status

- Jogo web: `index.html`
- Android: geração automática de **APK de teste** em Actions
- Web: publicação com GitHub Pages após habilitar Pages (Source: GitHub Actions)
- Atualizações: pacote ZIP web com verificação SHA-256, baixado em segundo plano e aplicado na próxima abertura
- Novas funções nativas exigem um novo APK
- O progresso local usa o armazenamento do aplicativo; **não apague os dados do app para atualizar**.

## Testar APK

Abra **Actions → Gerar APK Android → execução mais recente → Artifacts → Sudoklue-APK-debug**.
APK debug é para testes. Uma versão de distribuição precisará de assinatura estável.

## Publicar site e atualizações

Em Settings → Pages, escolha **GitHub Actions** como origem. O fluxo **Publicar site e atualizações** hospeda a versão atual e o manifesto de atualização. Após concluir, a URL padrão é https://danielgx21.github.io/Sudoklue/.

## Atualizar fases e arte

Altere `index.html`, aumente `version` em `versao.json` e faça commit em `main`. O fluxo web gera ZIP e atualiza o manifesto, e o APK já instalado baixa a versão compatível quando conectado.

Não altere `nativeFormat` sem lançar um novo APK preparado para esse formato. O APK deve ser testado num Android real antes de distribuição.
