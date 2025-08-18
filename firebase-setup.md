# Configuração do Firebase para Login Google

## Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Digite um nome para o projeto (ex: "allnime-app")
4. Siga os passos de configuração

## Passo 2: Configurar Autenticação

1. No console do Firebase, vá para "Authentication"
2. Clique em "Get started"
3. Vá para a aba "Sign-in method"
4. Clique em "Google" e habilite
5. Configure o nome do projeto e email de suporte
6. Salve as configurações

## Passo 3: Adicionar App Web

1. No console do Firebase, clique no ícone da web (</>)
2. Digite um nome para o app (ex: "allnime-web")
3. Clique em "Register app"
4. Copie as configurações que aparecerem

## Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_APP_ID=seu_app_id_aqui
```

## Passo 5: Configurar Domínios Autorizados

1. No Firebase Console, vá para "Authentication" > "Settings"
2. Na seção "Authorized domains", adicione:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção (quando tiver)

## Passo 6: Testar

1. Execute `npm run dev`
2. Clique no botão "Login Google"
3. Deve abrir o popup do Google para autenticação

## Exemplo de Configuração Completa

```env
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=allnime-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=allnime-app
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Troubleshooting

- Se o popup não abrir, verifique se o domínio está autorizado
- Se der erro de API key, verifique se copiou corretamente
- Se der erro de projeto, verifique se o projeto ID está correto
