# AllNime 🧩

AllNime é um aplicativo web moderno que permite aos usuários pesquisar informações sobre animes, visualizar detalhes, assistir (quando disponível) e manter um registro pessoal de avaliações.

## ✨ Funcionalidades Principais

*   **Busca Inteligente de Animes:** Campo de busca com sugestões dinâmicas enquanto você digita, utilizando a API Jikan.
*   **Página de Detalhes Completa:** Informações detalhadas para cada anime, incluindo:
    *   Capa (imagem)
    *   Título (original e em japonês)
    *   Sinopse completa
    *   Status (em exibição, finalizado, etc.)
    *   Número total de episódios
    *   Classificação etária e popularidade
*   **Links para Assistir (Experimental):** Integração com a API Consumet para fornecer links de streaming para episódios, quando disponíveis. (Esta funcionalidade é experimental e depende da disponibilidade da API Consumet).
*   **Avaliação Pessoal:**
    *   Sistema de avaliação de 1 a 5 estrelas.
    *   Campo para registrar uma opinião pessoal sobre o anime.
    *   As avaliações são salvas localmente no seu navegador (`localStorage`).
*   **Meus Avaliados:** Uma página dedicada para listar todos os animes que você já avaliou, com fácil acesso para ver os detalhes ou editar sua avaliação.
*   **Design Moderno e Responsivo:**
    *   Interface limpa e agradável.
    *   Layout responsivo que se adapta a diferentes tamanhos de tela (desktop, tablet, mobile).
    *   Suporte a modo claro e escuro, respeitando as preferências do seu sistema ou permitindo futura alternância manual.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:**
    *   React (v18+) com Vite
    *   JavaScript
    *   React Router DOM (v6) para roteamento
*   **Estilização:**
    *   TailwindCSS (v3)
*   **Comunicação com API:**
    *   Axios
*   **Ícones:**
    *   Lucide React
*   **APIs de Dados:**
    *   **Jikan API:** (`https://api.jikan.moe/v4`) - Fonte principal para informações e busca de animes.
    *   **Consumet API:** (Utilizando o wrapper em `https://consumet-api-production-host.vercel.app` durante o desenvolvimento) - Para buscar links de streaming (experimental).

## 🚀 Como Rodar o Projeto (Local e Deploy)

Siga os passos abaixo para configurar e rodar o AllNime na sua máquina local:

**Pré-requisitos:**

* Node.js LTS (recomendado: v18.x ou v20.x)
* npm (ou yarn)

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/athilalexandre/anime-master.git
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd anime-master
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    # ou, se você usa yarn:
    # yarn install
    ```

4.  **Rodar no desenvolvimento:**
    ```bash
    npm run dev
    # ou, se você usa yarn:
    # yarn dev
    ```

5.  **Abrir no navegador:**
    O projeto estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite no seu terminal).

### Build de produção

```
npm run build
npm run preview
```

O build é gerado em `dist/` (Vite). O `preview` serve a versão de produção localmente.

### Deploy na Vercel

O projeto inclui `vercel.json` configurando:

- build estático via `@vercel/static-build`
- rewrites de SPA para `index.html`

Passos:

1. Instalar a CLI: `npm i -g vercel`
2. Fazer login: `vercel login`
3. Deploy: `vercel` (primeira vez) e depois `vercel --prod`

Se já conectado ao GitHub, basta pushar na `main` que a Vercel faz o build. Caso use outro provider, confira se o comando de build é `npm run build` e a pasta de saída é `dist`.

## 📂 Estrutura do Projeto (Simplificada)

A estrutura principal do código-fonte na pasta `src/` é organizada da seguinte forma:

*   `components/`: Contém componentes React reutilizáveis.
    *   `common/`: Componentes genéricos (ex: botões, inputs - se criados).
    *   `layout/`: Componentes de estrutura da página (ex: Header, Footer).
*   `pages/`: Componentes React que representam as diferentes páginas da aplicação (ex: HomePage, AnimeDetailPage, MyRatingsPage).
*   `services/`: Módulos para interagir com APIs externas (Jikan, Consumet).
*   `hooks/`: Custom Hooks React (se houver).
*   `styles/` (ou `assets/css`): Arquivos CSS globais (ex: `index.css` com as diretivas do Tailwind).
*   `utils/`: Funções utilitárias.
*   `App.jsx`: Componente principal que configura o roteamento.
*   `main.jsx`: Ponto de entrada da aplicação React.

## 📝 Observações

*   As avaliações dos animes (notas e opiniões) são salvas exclusivamente no `localStorage` do seu navegador. Isso significa que elas são específicas para o navegador e dispositivo que você está usando e não são sincronizadas entre diferentes navegadores ou dispositivos.
*   A funcionalidade de "Assistir Agora" depende da API Consumet, que é um serviço de terceiros e pode ter sua disponibilidade ou estrutura alterada.

## 🤝 Contribuindo (Exemplo)

Contribuições são bem-vindas! Se você deseja melhorar o AllNime:

1.  Faça um Fork do projeto.
2.  Crie uma nova Branch (`git checkout -b feature/sua-feature`).
3.  Faça commit das suas alterações (`git commit -m 'Adiciona sua-feature'`).
4.  Faça Push para a Branch (`git push origin feature/sua-feature`).
5.  Abra um Pull Request.

---

Divirta-se explorando o mundo dos animes com o AllNime!
