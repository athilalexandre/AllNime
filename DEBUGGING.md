# 🐛 Guia de Debugging e Troubleshooting - AllNime

Este guia fornece informações detalhadas sobre como debugar e resolver problemas no projeto AllNime.

## 📋 Índice

1. [Sistema de Logging](#sistema-de-logging)
2. [Painel de Debug](#painel-de-debug)
3. [Problemas Comuns](#problemas-comuns)
4. [Configuração do Firebase](#configuração-do-firebase)
5. [Monitoramento de APIs](#monitoramento-de-apis)
6. [Comandos de Debug](#comandos-de-debug)

## 🔍 Sistema de Logging

### Visão Geral
O AllNime possui um sistema de logging avançado que captura:
- Erros de aplicação
- Chamadas de API
- Problemas de Firebase
- Performance de operações
- Informações do sistema

### Níveis de Log
- **DEBUG**: Informações detalhadas para desenvolvimento
- **INFO**: Informações gerais sobre o funcionamento
- **WARN**: Avisos sobre possíveis problemas
- **ERROR**: Erros que não impedem o funcionamento
- **CRITICAL**: Erros críticos que podem quebrar a aplicação

### Localização dos Logs
- **Console do navegador**: Logs em tempo real
- **LocalStorage**: Persistência local dos logs
- **Painel de Debug**: Interface visual para análise

## 🎛️ Painel de Debug

### Como Acessar
1. O botão de debug (🐛) aparece apenas em modo desenvolvimento
2. Clique no ícone de bug no header da aplicação
3. O painel se abre com três abas principais

### Abas Disponíveis

#### 📊 Logs
- Visualização em tempo real dos logs
- Filtros por nível de log
- Detalhes expandíveis para cada entrada
- Contador de logs e timestamp de atualização

#### 📈 API Stats
- Estatísticas de chamadas para cada API
- Contadores de erros e sucessos
- Duração média das requisições
- Avisos de rate limiting

#### 💻 System Info
- Informações do navegador
- Dados da aplicação
- Status de conectividade
- Informações de localStorage

### Funcionalidades do Painel
- **Auto-refresh**: Atualização automática a cada 2 segundos
- **Export**: Download dos logs em formato JSON
- **Clear**: Limpeza dos logs armazenados
- **Filter**: Filtragem por nível de log
- **Log Level**: Controle do nível de logging global

## ⚠️ Problemas Comuns

### 1. Erro de Firebase: "auth/invalid-api-key"

#### Sintomas
- Página em branco
- Erro no console: "Firebase: Error (auth/invalid-api-key)"
- Falha na inicialização da aplicação

#### Causas
- Variáveis de ambiente não configuradas
- Chave da API do Firebase inválida
- Configuração incorreta do projeto

#### Solução
1. **Criar arquivo `.env` na raiz do projeto:**
```bash
VITE_FIREBASE_API_KEY=sua_chave_api_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_APP_ID=seu_app_id
```

2. **Verificar configuração no Firebase Console:**
   - Acesse [console.firebase.google.com](https://console.firebase.google.com)
   - Selecione seu projeto
   - Vá em "Project Settings" > "General"
   - Role para baixo até "Your apps"
   - Clique no ícone web (</>)
   - Copie as configurações

3. **Reiniciar o servidor de desenvolvimento:**
```bash
npm run dev
```

### 2. APIs Externas com Rate Limiting

#### Sintomas
- Erros 429 (Too Many Requests)
- Avisos no console sobre rate limiting
- Falhas intermitentes nas requisições

#### APIs e Limites
- **Jikan API**: 60 chamadas/minuto
- **Consumet API**: 100 chamadas/minuto
- **Firebase**: 1000 chamadas/minuto

#### Solução
- Implementar cache local
- Reduzir frequência de requisições
- Usar debouncing para buscas
- Monitorar estatísticas no painel de debug

### 3. Problemas de Performance

#### Sintomas
- Operações lentas (>1 segundo)
- Interface travando
- Alto uso de memória

#### Solução
- Verificar logs de performance no painel de debug
- Implementar lazy loading
- Otimizar re-renders do React
- Usar React.memo para componentes pesados

## 🔥 Configuração do Firebase

### Passo a Passo

1. **Criar Projeto Firebase**
   - Acesse [console.firebase.google.com](https://console.firebase.google.com)
   - Clique em "Create a project"
   - Digite o nome do projeto
   - Configure Google Analytics (opcional)
   - Clique em "Create project"

2. **Configurar Autenticação**
   - No menu lateral, clique em "Authentication"
   - Clique em "Get started"
   - Vá para a aba "Sign-in method"
   - Habilite "Google"
   - Configure o domínio autorizado

3. **Obter Configuração Web**
   - Clique no ícone de engrenagem (⚙️) ao lado de "Project Overview"
   - Selecione "Project settings"
   - Role para baixo até "Your apps"
   - Clique no ícone web (</>)
   - Digite o nome da aplicação
   - Clique em "Register app"
   - Copie as configurações

4. **Configurar Variáveis de Ambiente**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as configurações copiadas:
```bash
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Verificação da Configuração

Use o painel de debug para verificar:
- Status do Firebase (aba System Info)
- Logs de inicialização do Firebase
- Erros de configuração

## 📡 Monitoramento de APIs

### Métricas Capturadas
- **Total de chamadas**: Número total de requisições
- **Taxa de erro**: Porcentagem de falhas
- **Duração média**: Tempo médio de resposta
- **Rate limiting**: Avisos quando próximo do limite

### Alertas Automáticos
- Rate limit atingindo 80% da capacidade
- Erros consecutivos (>3)
- Operações lentas (>1 segundo)
- Falhas de rede

### Logs de API
```javascript
// Exemplo de log de API
{
  level: "info",
  message: "API Call: jikan",
  data: {
    url: "https://api.jikan.moe/v4/anime",
    status: 200,
    duration: "150ms",
    result: "success",
    totalCalls: 45,
    errors: 0,
    avgDuration: 120
  },
  context: "api"
}
```

## 🛠️ Comandos de Debug

### Console do Navegador

#### Verificar Status do Firebase
```javascript
// Verificar saúde do Firebase
import { checkFirebaseHealth } from './src/services/auth/firebase.js';
console.log(checkFirebaseHealth());

// Verificar logs
import logger from './src/services/loggerService.js';
console.log(logger.getLogs());
console.log(logger.getAPIStats());
```

#### Controle de Logging
```javascript
// Mudar nível de log
logger.setLogLevel('DEBUG');

// Limpar logs
logger.clearLogs();

// Exportar logs
logger.exportLogs();
```

#### Monitoramento de Performance
```javascript
// Medir tempo de operação
const startTime = Date.now();
// ... sua operação ...
logger.logPerformance('Operação Customizada', Date.now() - startTime);
```

### Terminal

#### Verificar Variáveis de Ambiente
```bash
# Windows (PowerShell)
Get-ChildItem Env: | Where-Object {$_.Name -like "VITE_*"}

# Linux/Mac
env | grep VITE_
```

#### Logs do Servidor
```bash
# Ver logs do Vite
npm run dev

# Build com logs detalhados
npm run build --verbose
```

## 📱 Debug em Dispositivos Móveis

### Remote Debugging
1. **Chrome DevTools**
   - Conecte o dispositivo via USB
   - Ative "USB Debugging"
   - Use Chrome DevTools > More tools > Remote devices

2. **React Native Debugger** (se aplicável)
   - Instale o React Native Debugger
   - Conecte ao dispositivo
   - Use as ferramentas de debug

### Logs em Dispositivos
- Os logs são salvos no localStorage
- Use o painel de debug para visualizar
- Exporte logs para análise externa

## 🚨 Troubleshooting Avançado

### Problemas de Build
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versões
node --version
npm --version

# Build limpo
npm run build --force
```

### Problemas de Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Auditoria de segurança
npm audit

# Fix automático
npm audit fix
```

### Problemas de Rede
- Verificar CORS
- Testar APIs individualmente
- Verificar firewall e proxy
- Testar conectividade

## 📞 Suporte

### Recursos Úteis
- **Documentação Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **React DevTools**: [chrome.google.com/webstore/detail/react-developer-tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)

### Como Reportar Problemas
1. Use o painel de debug para coletar logs
2. Exporte os logs em formato JSON
3. Inclua informações do sistema
4. Descreva os passos para reproduzir
5. Adicione screenshots se relevante

---

**💡 Dica**: Sempre mantenha o painel de debug aberto durante o desenvolvimento para identificar problemas rapidamente!
