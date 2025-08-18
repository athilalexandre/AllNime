// Configuração temporária do Firebase para desenvolvimento
// IMPORTANTE: Este arquivo é apenas para desenvolvimento
// Para produção, use variáveis de ambiente reais

export const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "allnime-app.firebaseapp.com",
  projectId: "allnime-app",
  appId: "1:123456789:web:abcdef123456"
};

// Instruções para configurar Firebase real:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou use um existente
// 3. Vá em "Authentication" > "Sign-in method" > "Google" e habilite
// 4. Vá em "Project settings" > "General" > "Your apps" > "Add app" > "Web"
// 5. Copie as configurações e substitua os valores acima
// 6. Crie um arquivo .env na raiz do projeto com:
//    VITE_FIREBASE_API_KEY=sua_api_key_real
//    VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
//    VITE_FIREBASE_PROJECT_ID=seu_projeto_id
//    VITE_FIREBASE_APP_ID=seu_app_id_real
