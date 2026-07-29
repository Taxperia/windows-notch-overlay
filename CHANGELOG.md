# Changelog

Bu dosya, GitHub'daki son uygulama sürümü olan `v0.1.1` sonrasında yapılan kullanıcıya dönük değişiklikleri özetler.

## Unreleased - 2026-07-30

### Eklendi

- Çentik içine Pomodoro, kısa notlar, RAM temizleyici, bildirim merkezi, takvim, hava durumu ve pil detayı araçları eklendi.
- URL, boyut ve açma/kapatma kısayolları ayarlanabilen ekran içi video oynatma alanı eklendi.
- Ana saat alanında saat/tarih veya Pomodoro gösterme; indirme-yükleme hızı, ping ve kulaklık pili bilgilerini kapalı çentikte gösterme seçenekleri eklendi.
- Ayarların çentik içinde veya ayrı pencerede açılması, ayar araması ve kompakt/gelişmiş ayar modu eklendi.
- Mikrofon ve kamera aygıtı seçimi ile cihaz listesini yenileme desteği eklendi.
- Köşeli ve Blok çentik görünümleri, Floating alt görünümleri, saydam üst şerit ve canlı önizlemeli özel tema düzenleyicisi eklendi.
- Medya kaynağı için Spotify öncelikli, aktif Windows oturumu veya herhangi bir oturum seçimi ve üç farklı alarm sesi eklendi.

### Değiştirildi

- Windows medya yardımcısı seçilen medya oturumunu doğrudan kontrol edecek şekilde geliştirildi; gerektiğinde genel medya tuşlarına geri dönüyor.
- Bluetooth denetimi Windows Radio API'yi, parlaklık denetimi ise doğrulanmış WMI ve DDC/CI yollarını önceliklendirecek şekilde daha güvenilir hale getirildi.
- Parlaklık gösterimi `50%` biçimine getirildi; donanımsal olarak yazılamayan ekranlar daha doğru raporlanıyor.
- Ayar uygulama ve menü çizim akışı gereksiz tekrarları azaltacak şekilde optimize edildi; medya ve kontrol sorgu aralıkları seyrekleştirildi.
- Ses mikseri yenileme eylemi araç başlığına taşındı, Hakkında ekranı ve genel ayar arayüzü yenilendi.

### Düzeltildi

- Preload saat geri dönüşünün Pomodoro ile saat/tarih arasında oluşturduğu görüntü geçişi kaldırıldı.
- Ağ hızı ilk örneğinde oluşabilen boş örnek hatası giderildi; indirme ve yükleme değerleri ayrı ve doğru birimlerle gösteriliyor.
- Ekran içi videonun ayrı ayar penceresinde açılması engellendi; video her zaman ana çentikte gösteriliyor.
- Ek içerikler etkinleştirildiğinde kapalı çentiğin genişliği ve saat/tarih yerleşimi daha kararlı hale getirildi.

### Deneysel / Devre Dışı

- GitHub bildirimleri için token doğrulama, güvenli saklama ve bildirim sağlayıcı altyapısı hazırlandı; harici uygulama arayüzü ve arka plan sorguları bu sürümde özellik bayraklarıyla kapalıdır.
- Kulaklık pil değeri Windows ve donanım desteğine bağlı olarak en iyi çabayla okunur; desteklenmeyen cihazlarda değer gösterilmeyebilir.
