# progress2.md Faz Notları

Son güncelleme: 2026-05-16

## Yapılanlar

- Proje yedeği `C:\Users\talba\Desktop\gdf-backup-20260515-215746` klasörüne alındı.
- Ayarlar için uygulama içi / ayrı pencere tercihi eklendi.
- Ayrı ayar penceresi için ana süreç, preload ve renderer akışı bağlandı.
- Ses mikseri yenileme aksiyonu ikon butonuna çevrildi.
- Harici uygulamalar ana menüden çıkarıldı ve ayarlar altında entegrasyon taslağına taşındı.
- Floating görünüm seçilince Pill ve Kompakt alt görünüm menüsü açılacak şekilde görünüm ayarı ayrıldı.
- Harici uygulamalar için Bağla, olay filtreleri ve mesaj rengi ayarları eklendi.
- Girişteki Windows Dynamic Notch başlığı kaldırıldı.
- Tema özelleştir düğmesi ikon-only hale getirildi.
- Hakkında görünümü daha profil kartı benzeri, vurgulu düzene taşındı.
- Mikrofon ve kamera seçim alanları eklendi.
- Ekran içi video penceresi, URL, boyut ve PageUp/PageDown kısayol ayarları eklendi.
- Pomodoro ve Notlar hızlı menüleri eklendi.
- Ana saat alanı içeriği, indirme hızı, ping ve kulaklık pil seçenekleri eklendi.
- `idea/` altında Faz 4 fikir dosyaları oluşturuldu.

## Teknik Notlar

- Harici uygulama "Bağla" düğmesi GitHub için gerçek token doğrulaması başlatır; YouTube/Discord tarafında sağlayıcı kısıtları ve credential gereksinimleri gösterilir.
- GitHub gerçek bildirimleri token ile API'den çekilir; YouTube/Discord tarafında provider credential ve platform sınırı notları UI'da gösterilir.
- Kulaklık pil verisi donanım/Windows API desteğine bağlı olduğu için şimdilik gösterim alanı hazır, değer `--` olarak kalır.
- İndirme hızı Windows `netstat -e`, ping `ping.exe` üzerinden best-effort okunur.

## Doğrulama

- `node --check src/main/index.js`
- `node --check src/main/appSettings.js`
- `node --check src/preload.js`
- `node --check src/renderer/renderer.js`

## 2026-05-15 Hotfix

- `extras:network` ilk ölçümde `lastNetworkSample` null iken `timestamp` okumaya çalışıyordu; hız hesabı artık sadece önceki örnek gerçekten varsa yapılıyor.
- Girişteki Kontrol merkezi kartı kaldırıldı, Tema özelleştir ikonu ortalandı.
- Harici uygulama bağlantısı sonrası `Bağlandı` durumu ve çark ikonundan açılan ayar modali eklendi.
- Pomodoro çalışırken saat/tarih alanında yalnızca sayaç gösterilecek şekilde güncellendi.

## 2026-05-15 Küçük Bug Fix Paketi

- Pomodoro ile saat/tarih arasında gidip gelen görüntünün nedeni olan preload saat fallback'i kaldırıldı.
- Giriş > Görünüm alanında Ekrana bağlı, Floating, Pill ve Kompakt tasarımlar aynı anda görünür hale getirildi.
- İndirme hızı, ping ve kulaklık pili göstergeleri hover panelinden çıkarılıp kapalı ana çentiğin sağ tarafına taşındı.
- Kulaklık pili için Windows PnP cihaz pil seviyesi best-effort okuması eklendi.
- Ekran içi video ayrı pencere yerine ana paneli uzatarak webview içinde açılacak şekilde değiştirildi; PageUp/PageDown sinyali de ana panele yönlendirildi.
- Harici uygulamalardaki hızlı hedef butonları kaldırıldı; logo alanı orijinal görünüme yakın SVG logolar için hazırlandı.
- Ses mikseri yenileme butonu tool başlığının sağ tarafındaki ikon slotuna taşındı.
- Hakkımda sayfası verilen launcher görseline benzer beyaz, ortalanmış düzenle yenilendi.

## 2026-05-15 Düzeltme

- Hakkımda bölümü mevcut kart stilinden ayrılarak görseldeki launcher yapısına göre sıfırdan düzenlendi.
- Görünüm ayarı tekrar iki ana seçenekli hale getirildi: Ekrana bağlı ve Floating. Floating seçilince Floating, Pill ve Kompakt alt görünüm menüsü açılıyor.

## 2026-05-16 Harici Uygulamalar Netleştirme

- Harici uygulama kartlarındaki "ana sayfa", "abonelik" ve hızlı hedef hissi veren metinler entegrasyon/bildirim odağına çekildi.
- Harici uygulama hızlı paneli pasifleştirilerek kullanıcı ayarlardan yönetim akışına yönlendirildi.
- YouTube, YouTube Music, Discord ve GitHub logoları `src/renderer/assets/external/` altındaki değiştirilebilir SVG dosyalarına taşındı.

## 2026-05-16 Harici Uygulamalar Askıya Alma

- Harici uygulamalar `SHOW_EXTERNAL_APPS = false` ile arayüzden kaldırıldı.
- Ana süreçte `ENABLE_EXTERNAL_INTEGRATIONS = false` ile gerçek entegrasyon IPC ve bildirim polling pasife alındı.
- Kod silinmedi; ileride tekrar açmak için flag'ler yeterli olacak.

## 2026-05-16 Gerçek Login ve Bildirim

- GitHub için token doğrulama, güvenli token saklama ve GitHub Notifications API poller eklendi.
- GitHub bağlantısı başarılı olunca ayarlara bağlı hesap adı yazılır ve yeni API bildirimleri mevcut kayan yazı alanına gönderilir.
- Discord kullanıcı DM/arama içeriğinin OAuth ile okunamadığı, YouTube için Google OAuth Client/Data API gerektiği modalda açık gösterilir.

## 2026-05-16 Kapalı Çentik İçerik Düzeltmesi

- Kapalı çentikte saat/tarih eski boyutunda kalacak şekilde düzenlendi.
- Ek göstergeler aktif oldukça çentik genişliği 1/2/3 gösterge için kademeli büyür; sadece ekstra içerik alanı kompaktlaşır.
- Ek göstergelerin yazı dili saat/tarih ile eşitlendi: gri etiket, beyaz değer, 14px boşluk ve sabit font boyutu.
- İndirme hızı birimi `M/s` yerine açık `MB/s`/`KB/s` gösterilecek şekilde düzeltildi; ölçümde Windows `BytesReceivedPersec` performans sayacı önceliklendirildi.

## 2026-05-16 Ekran İçi Video Düzeltmesi

- Ekran içi video ayrı `BrowserWindow` kodundan çıkarıldı; video sadece ana çentik içindeki `videoStage` alanında açılır.
- Ayarlar ayrı penceredeyken `Göster` butonu artık ayar penceresinde video açmaz, ana çentiğe inline video sinyali gönderir.
- Alt medya kontrol satırına ve Spotify özel görünümündeki medya kontrollerine ekran içi video ikonu eklendi.
- YouTube `watch` linkleri artık `embed` URL'ye çevrilmiyor; Electron webview içinde `Hata 153` üretmemesi için tam YouTube sayfası açılıyor.
- Video sahnesi panel tasarımı uygulama temasına daha uygun olacak şekilde toparlandı.
- Ağ göstergesinde `DL` yazısı kaldırıldı; indirme `↓`, yükleme `↑` işaretiyle gösteriliyor ve hız varsayılan ağ adaptörünün byte farkından hesaplanıyor.

## 2026-07-11 UI / Performans Paketi

- Parlaklık yüzdesi `50%` formatına alındı; menü karosu sürekli aktif boyanmıyor.
- Ayarlar penceresindeki File/Edit native menü kaldırıldı (`Menu.setApplicationMenu(null)`).
- Giriş > Görünüm'e Köşeli ve Blok eklendi; 7. tema özel renk sayfası canlı önizlemeli.
- Ayar güncellemelerinde çift `applySettings` ve gereksiz menü yeniden çizimi azaltıldı; kontrol/parlaklık poll aralığı gevşetildi.
- Menülere RAM temizleyici eklendi.
- İndirme hızı açıkken saat-tarih ve extras arası boşluk sıkılaştırıldı.
