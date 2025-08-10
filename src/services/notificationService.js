// src/services/notificationService.js
import { getCurrentSeasonAnimes } from './jikanService.js';

class NotificationService {
  constructor() {
    this.notifications = this.loadNotifications();
    this.preferences = this.loadPreferences();
    this.checkInterval = null;
  }

  // Carrega notificações salvas
  loadNotifications() {
    try {
      const notifications = localStorage.getItem('animeNotifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      return [];
    }
  }

  // Carrega preferências de notificação
  loadPreferences() {
    try {
      const preferences = localStorage.getItem('notificationPreferences');
      return preferences ? JSON.parse(preferences) : {
        newEpisodes: true,
        seasonReleases: true,
        favoritesUpdates: true,
        soundEnabled: true,
        desktopNotifications: true
      };
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return {
        newEpisodes: true,
        seasonReleases: true,
        favoritesUpdates: true,
        soundEnabled: true,
        desktopNotifications: true
      };
    }
  }

  // Salva notificações
  saveNotifications() {
    try {
      localStorage.setItem('animeNotifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  // Salva preferências
  savePreferences() {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  }

  // Adiciona uma nova notificação
  addNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    
    // Limita a 100 notificações
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();
    this.showNotification(notification);
    
    return notification;
  }

  // Adiciona notificação específica para conteúdo adulto bloqueado
  addAdultContentBlockedNotification(animeTitle = 'anime') {
    return this.addNotification(
      'adultContentBlocked',
      'Conteúdo Adulto Bloqueado',
      `Você não pode acessar "${animeTitle}" devido às restrições de idade. Faça login e verifique se você é maior de 18 anos.`,
      { 
        type: 'adultContentBlocked',
        requiresLogin: true,
        requiresAgeVerification: true
      }
    );
  }

  // Adiciona notificação para usuário não autenticado tentando acessar conteúdo adulto
  addLoginRequiredNotification(animeTitle = 'anime') {
    return this.addNotification(
      'loginRequired',
      'Login Necessário',
      `Para acessar "${animeTitle}" e outros conteúdos adultos, você precisa fazer login com uma conta Google.`,
      { 
        type: 'loginRequired',
        requiresLogin: true,
        actionUrl: '/'
      }
    );
  }

  // Marca notificação como lida
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Marca todas como lidas
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Remove notificação
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Remove todas as notificações
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Obtém notificações não lidas
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  // Obtém notificações por tipo
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Atualiza preferências
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  // Mostra notificação na tela
  showNotification(notification) {
    if (!this.preferences.desktopNotifications) return;

    // Cria elemento de notificação
    const notificationElement = document.createElement('div');
    notificationElement.className = 'fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50 transform transition-all duration-300 translate-x-full';
    notificationElement.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-white text-sm">📺</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">${notification.title}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">${notification.message}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notificationElement);

    // Anima entrada
    setTimeout(() => {
      notificationElement.classList.remove('translate-x-full');
    }, 100);

    // Remove após 5 segundos
    setTimeout(() => {
      notificationElement.classList.add('translate-x-full');
      setTimeout(() => {
        if (notificationElement.parentElement) {
          notificationElement.remove();
        }
      }, 300);
    }, 5000);

    // Toca som se habilitado
    if (this.preferences.soundEnabled) {
      this.playNotificationSound();
    }
  }

  // Toca som de notificação
  playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignora erros de autoplay
    } catch (error) {
      console.error('Erro ao tocar som:', error);
    }
  }

  // Inicia verificação automática de notificações
  startAutoCheck() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000); // Verifica a cada 30 minutos
  }

  // Para verificação automática
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Verifica por atualizações
  async checkForUpdates() {
    try {
      // Verifica novos animes da temporada
      if (this.preferences.seasonReleases) {
        await this.checkSeasonReleases();
      }

      // Verifica atualizações dos favoritos
      if (this.preferences.favoritesUpdates) {
        await this.checkFavoritesUpdates();
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }

  // Verifica novos lançamentos da temporada
  async checkSeasonReleases() {
    try {
      const currentSeason = await getCurrentSeasonAnimes();
      const lastChecked = localStorage.getItem('lastSeasonCheck');
      const currentDate = new Date().toISOString().split('T')[0];

      if (lastChecked !== currentDate && currentSeason.data) {
        const newAnimes = currentSeason.data.slice(0, 5); // Top 5 novos
        
        newAnimes.forEach(anime => {
          this.addNotification(
            'seasonRelease',
            'Novo Anime da Temporada!',
            `${anime.title} foi adicionado à temporada atual`,
            { animeId: anime.mal_id, animeTitle: anime.title }
          );
        });

        localStorage.setItem('lastSeasonCheck', currentDate);
      }
    } catch (error) {
      console.error('Erro ao verificar lançamentos da temporada:', error);
    }
  }

  // Verifica atualizações dos favoritos
  async checkFavoritesUpdates() {
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '{}');
      const watching = watchlist.watching || [];

      // Simula verificação de novos episódios
      // Em produção, isso seria uma API call para verificar status
      if (watching.length > 0 && this.preferences.newEpisodes) {
        // Por enquanto, apenas simula
        console.log('Verificando novos episódios para animes em watching...');
      }
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
  }

  // Solicita permissão para notificações desktop
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Obtém estatísticas de notificações
  getNotificationStats() {
    const total = this.notifications.length;
    const unread = this.getUnreadNotifications().length;
    const byType = {};

    this.notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return { total, unread, byType };
  }
}

export const notificationService = new NotificationService();
