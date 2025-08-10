# 🧩 AllNime - Your Ultimate Anime Companion

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<div align="center">
  <img src="public/assets/anime-master-favicon.svg" alt="AllNime Logo" width="120" height="120">
  <h3>🇧🇷 Português | 🇺🇸 English</h3>
</div>

---

## 🇧🇷 Português

### 📖 Sobre o Projeto

**AllNime** é uma aplicação web moderna e completa para gerenciar sua jornada pelos animes. Desenvolvida com React e Vite, oferece uma experiência fluida e responsiva para descobrir, avaliar e organizar seus animes favoritos.

### ✨ Funcionalidades Principais

#### 🔍 **Sistema de Busca Avançado**
- **Busca Inteligente**: Campo de busca com sugestões em tempo real
- **Filtros Avançados**: Por gênero, tipo, status, pontuação e mais
- **Histórico de Buscas**: Mantém suas pesquisas recentes
- **Busca por Gênero**: Explore animes por categorias específicas

#### 📱 **Interface Moderna e Responsiva**
- **Design Adaptativo**: Funciona perfeitamente em desktop, tablet e mobile
- **Tema Claro/Escuro**: Suporte automático e manual para temas
- **Animações Suaves**: Transições e micro-interações elegantes
- **Layout Intuitivo**: Navegação clara e organizada

#### 🎯 **Gerenciamento de Listas**
- **Minhas Listas**: Organize animes por status (Assistindo, Planejo Assistir, Completos, Desistidos)
- **Sistema de Avaliações**: Notas de 1-5 estrelas com opiniões pessoais
- **Estatísticas Detalhadas**: Visualize seu progresso e preferências
- **Sincronização Local**: Dados salvos no seu navegador

#### 🌟 **Descoberta de Conteúdo**
- **Animes da Temporada**: Novos lançamentos atualizados
- **Top Animes**: Rankings populares e bem avaliados
- **Recomendações**: Sugestões baseadas em seus gostos
- **Exploração por Gênero**: Descubra novos animes por categoria

#### ⚙️ **Configurações Personalizáveis**
- **Preferências de Tema**: Múltiplas opções de cores e modo automático
- **Configurações de Idioma**: Suporte para português e inglês
- **Notificações**: Alertas para novos episódios e lançamentos
- **Backup e Restauração**: Exporte e importe seus dados

### 🛠️ Stack Tecnológica

#### **Frontend**
- **React 18+** - Biblioteca principal para interface
- **Vite** - Build tool ultra-rápido
- **React Router DOM 6** - Roteamento da aplicação
- **Tailwind CSS 3** - Framework CSS utility-first

#### **APIs e Serviços**
- **Jikan API v4** - Dados completos de animes (MyAnimeList)
- **Consumet API** - Links de streaming (experimental)
- **Firebase Auth** - Autenticação com Google
- **LocalStorage** - Persistência local de dados

#### **Ferramentas e Bibliotecas**
- **Axios** - Cliente HTTP para APIs
- **Lucide React** - Ícones modernos e consistentes
- **ESLint** - Qualidade e padronização de código
- **PostCSS** - Processamento de CSS

### 🚀 Como Executar

#### **Pré-requisitos**
- Node.js 18+ (LTS recomendado)
- npm ou yarn
- Git

#### **Instalação e Execução**

```bash
# Clone o repositório
git clone https://github.com/athilalexandre/allnime.git

# Entre no diretório
cd allnime

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da produção
npm run preview
```

#### **Deploy na Vercel**
O projeto está configurado para deploy automático na Vercel:

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel
```

### 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes genéricos
│   ├── contexts/       # Contextos React (Auth, Language)
│   ├── features/       # Funcionalidades específicas
│   │   ├── anime-detail/   # Detalhes de anime
│   │   ├── home/           # Componentes da página inicial
│   │   └── search/         # Sistema de busca
│   └── layout/         # Header, Footer
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
├── hooks/              # Custom hooks
├── contexts/           # Contextos globais
└── styles/             # Estilos globais
```

### 🔧 Scripts Disponíveis

```json
{
  "dev": "vite",                    // Servidor de desenvolvimento
  "build": "vite build",            // Build de produção
  "preview": "vite preview",        // Preview do build
  "lint": "eslint .",               // Verificação de código
  "lint:fix": "eslint . --fix"      // Correção automática
}
```

### 🌐 Funcionalidades de Internacionalização

- **Português (pt-BR)** - Idioma padrão
- **Inglês (en-US)** - Suporte completo
- **Tradução automática** de interface
- **Formatação localizada** de datas e números

### 🔒 Privacidade e Segurança

- **Dados locais**: Suas avaliações ficam apenas no seu navegador
- **Sem rastreamento**: Não coletamos dados pessoais
- **HTTPS obrigatório**: Conexões seguras em produção
- **Controle de idade**: Filtros para conteúdo +18

### 🤝 Contribuindo

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/allnime.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🇺🇸 English

### 📖 About the Project

**AllNime** is a modern and comprehensive web application for managing your anime journey. Built with React and Vite, it offers a smooth and responsive experience for discovering, rating, and organizing your favorite animes.

### ✨ Main Features

#### 🔍 **Advanced Search System**
- **Smart Search**: Real-time search field with suggestions
- **Advanced Filters**: By genre, type, status, score and more
- **Search History**: Keeps your recent searches
- **Genre Search**: Explore animes by specific categories

#### 📱 **Modern and Responsive Interface**
- **Adaptive Design**: Works perfectly on desktop, tablet and mobile
- **Light/Dark Theme**: Automatic and manual theme support
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Intuitive Layout**: Clear and organized navigation

#### 🎯 **List Management**
- **My Lists**: Organize animes by status (Watching, Plan to Watch, Completed, Dropped)
- **Rating System**: 1-5 star ratings with personal opinions
- **Detailed Statistics**: View your progress and preferences
- **Local Sync**: Data saved in your browser

#### 🌟 **Content Discovery**
- **Seasonal Animes**: Updated new releases
- **Top Animes**: Popular and well-rated rankings
- **Recommendations**: Suggestions based on your tastes
- **Genre Exploration**: Discover new animes by category

#### ⚙️ **Customizable Settings**
- **Theme Preferences**: Multiple color options and automatic mode
- **Language Settings**: Support for Portuguese and English
- **Notifications**: Alerts for new episodes and releases
- **Backup and Restore**: Export and import your data

### 🛠️ Tech Stack

#### **Frontend**
- **React 18+** - Main interface library
- **Vite** - Ultra-fast build tool
- **React Router DOM 6** - Application routing
- **Tailwind CSS 3** - Utility-first CSS framework

#### **APIs and Services**
- **Jikan API v4** - Complete anime data (MyAnimeList)
- **Consumet API** - Streaming links (experimental)
- **Firebase Auth** - Google authentication
- **LocalStorage** - Local data persistence

#### **Tools and Libraries**
- **Axios** - HTTP client for APIs
- **Lucide React** - Modern and consistent icons
- **ESLint** - Code quality and standardization
- **PostCSS** - CSS processing

### 🚀 How to Run

#### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

#### **Installation and Execution**

```bash
# Clone the repository
git clone https://github.com/athilalexandre/anime-master.git

# Enter the directory
cd anime-master

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Preview production
npm run preview
```

#### **Deploy to Vercel**
The project is configured for automatic deployment on Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Generic components
│   ├── contexts/       # React contexts (Auth, Language)
│   ├── features/       # Specific functionalities
│   │   ├── anime-detail/   # Anime details
│   │   ├── home/           # Home page components
│   │   └── search/         # Search system
│   └── layout/         # Header, Footer
├── pages/              # Application pages
├── services/           # Services and APIs
├── hooks/              # Custom hooks
├── contexts/           # Global contexts
└── styles/             # Global styles
```

### 🔧 Available Scripts

```json
{
  "dev": "vite",                    // Development server
  "build": "vite build",            // Production build
  "preview": "vite preview",        // Build preview
  "lint": "eslint .",               // Code verification
  "lint:fix": "eslint . --fix"      // Automatic correction
}
```

### 🌐 Internationalization Features

- **Portuguese (pt-BR)** - Default language
- **English (en-US)** - Complete support
- **Automatic translation** of interface
- **Localized formatting** of dates and numbers

### 🔒 Privacy and Security

- **Local data**: Your ratings stay only in your browser
- **No tracking**: We don't collect personal data
- **HTTPS required**: Secure connections in production
- **Age control**: Filters for +18 content

### 🤝 Contributing

1. **Fork** the project
2. **Clone** your fork: `git clone https://github.com/your-username/allnime.git`
3. **Create** a branch: `git checkout -b feature/new-feature`
4. **Commit** your changes: `git commit -m 'Add new feature'`
5. **Push** to the branch: `git push origin feature/new-feature`
6. **Open** a Pull Request

### 📝 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

---

## 🌟 Status do Projeto / Project Status

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/athilalexandre/allnime)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A%2B-00ff00)](https://github.com/athilalexandre/allnime)
[![Last Commit](https://img.shields.io/badge/Last%20Commit-Active-brightgreen)](https://github.com/athilalexandre/allnime)

---

<div align="center">
  <p><strong>Made with ❤️ by the AllNime Team</strong></p>
  <p>Star ⭐ this repository if you found it helpful!</p>
</div>
