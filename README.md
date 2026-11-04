# pdm_rodrigo

Aplicativo mobile desenvolvido na disciplina de **Programação de Dispositivos Móveis** (PDM) do curso
de Tecnologia em Sistemas para Internet, IFSul Câmpus Pelotas, sob orientação do **Prof. Gill Velleda
Gonzales**.

**Autor:** Rodrigo Miranda da Silva ([@Rodrimir](https://github.com/Rodrimir)).

## O que o aplicativo faz

É um app de conta de usuário completo, construído com Expo e React Native:

- **Autenticação** com Firebase: cadastro, entrada, recuperação de senha e sessão persistente.
- **Perfil do usuário** com foto, editável pela câmera ou pela galeria do aparelho.
- **Preferências** de tema, idioma e fuso horário, guardadas por usuário.
- **Navegação em abas** com Expo Router, separando a área autenticada da área pública.
- **Notificações** e armazenamento seguro de credenciais no dispositivo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo (SDK 58) com React Native |
| Linguagem | TypeScript |
| Navegação | Expo Router |
| Autenticação e dados | Firebase |
| Formulários | React Hook Form com validação por schema |
| Build e distribuição | EAS Build (APK, AAB e dev client) |
| Interface | Expo UI, Expo Symbols e Expo Image |

## Estrutura

O código fica em `src`:

- `app` — as telas e o roteamento. Entrar, cadastrar, recuperar senha, perfil e as abas internas.
- `context` — provedores de estado global: `AuthProvider` para a sessão e `UserProvider` para os dados do usuário.
- `firebase` — configuração e inicialização do SDK.
- `model` — tipos do domínio: usuário, tema, idioma e fuso.
- `services` — integrações externas, como a consulta de localização.

## Executar localmente

Requer Node.js 20 ou superior e um aparelho ou emulador Android.

```bash
npm install
npx expo start
```

Para rodar no dev client ou gerar um instalador, use o EAS:

```bash
npm install --global eas-cli
eas build --profile development --platform android
```

O arquivo `google-services.json` do Firebase é necessário para a autenticação funcionar e não
acompanha o repositório público; crie um projeto no Firebase e baixe o seu.

## Licença

MIT. Veja [LICENSE](LICENSE).
