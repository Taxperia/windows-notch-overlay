# Harici Uygulama Entegrasyon Notları

Son güncelleme: 2026-05-15

Discord, GitHub ve YouTube senaryoları yapılabilir, ama gerçek bağlantı için her servis ayrı izin modeli ister:

- Discord: OAuth2 ile kullanıcı kimliği alınır; DM, sunucu mesajı ve arama gibi olaylar için Gateway izinleri ve bot/kullanıcı kapsamı dikkatle ayrılmalıdır.
- GitHub: OAuth App veya GitHub App ile bildirim, issue, pull request ve workflow izinleri alınır.
- YouTube: Google OAuth ile YouTube Data API kullanılır; abonelik, kanal, yorum ve canlı yayın olayları kota sınırına tabidir.
- Renkli kayan yazı ve menü renklendirme uygulama içinde yapılabilir; gerçek veri kaynağı geldikten sonra mevcut `integrations` ayarları bu olayları filtrelemek için kullanılabilir.
- Tokenlar ayar JSON dosyasında tutulmamalı; Windows Credential Manager veya Electron safeStorage benzeri korumalı saklama tercih edilmeli.
