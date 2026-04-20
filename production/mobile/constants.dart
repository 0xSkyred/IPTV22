class AppConfig {
  // Troque pelo seu domínio real com HTTPS configurado no Nginx
  static const String apiBaseUrl = "https://stream-ai.meuprojeto.com/api";
  static const String wsUrl = "wss://stream-ai.meuprojeto.com/ws";
  
  // Timeout aumentado para redes móveis instáveis
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;

  // Chaves de Terceiros (Produção)
  static const String stripePublishableKey = "pk_live_your_key";
}
