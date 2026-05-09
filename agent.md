# Windows Dynamic Notch Agent Notes

Bu proje Windows için Electron tabanlı dinamik bir çentik uygulamasıdır. Amaç sadece sabit bir overlay yapmak değil; durumlara göre şekil değiştiren, bildirimleri ve hızlı aksiyonları gösteren, oyun/metrik durumlarını okuyabilen bir masaüstü kontrol merkezi oluşturmaktır.

## Ürün Davranışı

- Kapalı durumda ekranın üst ortasında ince bir çentik görünür.
- Kapalı durumda sadece saat ve tarih görünür.
- Hover durumunda çentik kontrollü biçimde genişler.
- Geniş durumda saat/tarih sol üstte küçük görünür.
- Sağ üstte ayarlar çarkı bulunur.
- Ayarlar çarkı Windows ayarlarına değil uygulamanın kendi ayar ekranına gider.
- Ana alan telefon kontrol merkezi gibi hızlı menü tile'ları gösterir.
- Bir sayfada 8 menü görünür.
- 8'den fazla menü varsa yatay kaydırma ve sayfa noktaları kullanılır.
- Ayarlar > Hızlı menüler bölümündeki aç/kapat listesi kendi içinde dikey scrollbar kullanmalıdır.
- Yeni özellikler menü veri listesine eklenince otomatik olarak carousel içinde görünmelidir.
- Kullanıcı hızlı menü öğelerini uygulama ayarlarından kapatıp açabilmelidir.
- Kullanıcı hızlı menü öğelerine uzun basıp sürükleyerek sıralamayı sayfalar arasında değiştirebilmelidir.
- Dil, Tema ve Görünüm ayrı sidebar menüsü olmamalıdır; Giriş ekranında toplanmalıdır.
- Dil seçimi dropdown olmalı ve `src/renderer/i18n/*.json` dosyalarından dinamik beslenmelidir.
- Tema seçenekleri hazır preset'ler, Light tema ve özel renk seçimi içermelidir.
- Görünüm bölümünde ekran üstüne yapışık varsayılan çentik, ekrandan ayrık border'lı floating çentik ve ek görünümler önizlemeyle seçilebilmelidir.
- Windows ile başlat ayarı uygulama içinden kontrol edilmelidir.
- Release açıklamalarında yeni gelen özellikler ve hata düzeltmeleri ayrı biçimde yazılmalıdır.

## Menü Kapsamı

- El feneri, konum, otomatik döndür ve uçak modu masaüstü hedefi için kaldırıldı.
- Kamera ve mikrofon menüleri Windows gizlilik durumunu gösterir.
- Kamera veya mikrofon kapatıldığında Windows kullanıcı gizlilik izinleri `Deny` yapılır.
- Kamera veya mikrofon açıldığında aynı izinler `Allow` yapılır.
- Mikrofon hızlı menüsü sistem sesini kapatmamalı, aygıt disable etmemeli ve Windows privacy değerlerini kapalıya çekmemelidir.
- Mikrofon için `pnputil disable` normal akışta kullanılmamalıdır; Windows yeniden başlatma sonrası endpoint kapalı kalabildiği için yalnızca eski bozuk durumu onarmak amacıyla kullanılmalıdır.
- Mikrofon kapatılırken Windows privacy `Deny` yazılmamalıdır; bu bazı uygulamalarda stream'i koparıp açınca sesin geri gelmemesine neden olur.
- Mikrofon açılırken kullanıcının Windows'ta seçtiği varsayılan giriş aygıtı değiştirilmemelidir.
- Mikrofon onarım işlemi yalnızca `Allow` + capture unmute yönünde olmalıdır; kapatma davranışı kaldırılmıştır.
- Güvenli mikrofon sağlayıcısı netleşene kadar hızlı menü mikrofon aksiyonu Windows capture ayarını değiştirmemelidir.
- Bluetooth tile'ı Windows bağlı aygıt durumunu okumaya çalışır ve adaptörü `pnputil` ile açıp kapatmayı dener.
- Bluetooth adaptör algılama genel aygıt listesini taramamalıdır; ağ/internet adaptörlerine dokunmamak için sadece Bluetooth class içindeki ve açıklamasında Bluetooth radyo/adaptör kimliği olan aygıtlar hedeflenmelidir.
- Bluetooth adaptörü aç/kapatma Windows yönetici izni isteyebilir; izin yoksa UI bunu açıkça söylemelidir.
- Ses mikseri tile'ı Windows ses mikserini açmalıdır.
- Parlaklık tile'ı çentik içinde slider göstermeli; desteklenmeyen ekranlarda kullanıcıya açık mesaj vermelidir.
- Harici Uygulamalar tile'ı kullanıcı dosya seçimi yaptırmamalıdır; YouTube, YouTube Music, Discord, GitHub gibi projeye kodla eklenen yerleşik servisleri göstermelidir.
- Sessiz mod Windows bildirim ayarlarıyla uyumlu çalışacak şekilde ele alınır.
- Sessiz mod, karanlık mod, güç tasarrufu ve ağ tile'ları kullanıcıyı Windows ayarlarına atmamalıdır; doğrudan toggle ya da hızlı panel davranışı tercih edilmelidir.
- Gece ışığı için belgelenmemiş CloudStore binary hack'i kullanılmamalıdır; güvenli sağlayıcı yoksa ayar sayfası açmadan hızlı işlemler paneli gösterilmelidir.
- Hızlı menüde "Sessiz mod" yerine Windows karşılığı olan "Odaklanma yardımı" kullanılmalıdır.
- "Göz rahatlığı" tile'ı "Gece Işığı" olarak adlandırılmalıdır.
- Güç Tasarrufu laptopta pil tasarrufu davranışını, masaüstünde Windows güç planı davranışını yönetmelidir.
- Oyun çubuğu ve Görevler tile'ları hızlı menüde bulunmamalıdır.
- Alarm ve Arama Windows uygulamasına yönlenmemelidir; çentik içinde ayrı sayfa açmalıdır.
- Arama sorgusu varsayılan tarayıcıda web araması olarak açılmalıdır.
- Alarm formu net saat seçmelidir; alarm zamanı geldiğinde kapalı çentikte saat/tarih yerine alarm adı ve alarm saati görünmelidir.
- Alarm aktifken hover genişlemesinde alarm kapatma sahnesi gösterilmeli ve kullanıcı alarmı buradan kapatabilmelidir.
- Alarm aktifliği 1 dakika sürmeli; süre dolunca alarm otomatik kapanmalı ve saat/tarih görünümü geri gelmelidir.
- Alarm durumu medya gibi diğer dinamik sahnelerden önceliklidir.
- Windows bildirimi geldiğinde geniş menüdeki saat/tarih alanı geçici olarak gizlenmeli ve bildirim metni sağdan sola kayan ticker olarak gösterilmelidir.
- UI metinlerinde Türkçe karakter kullanılmalıdır.
- Hızlı menü renklerinde `linear-gradient` kullanılmamalıdır; solid renklerle durum anlatılmalıdır.
- Spotify gibi aktif dinamik durumlar ana hızlı menüden daha öncelikli olabilir.
- Spotify şarkı çalarken hover açılışında medya sahnesi gösterilir; Spotify sadece açık ya da duraklatılmışsa hızlı menüler gösterilir. Geri butonu aynı açık oturumda hızlı menülere döndürür.
- Spotify medya sahnesinde şarkı adı, sanatçı, avatar, timeline, oynat/duraklat, önceki/sonraki ve sağda hareketli ses çubukları bulunmalıdır.
- Medya sahnesi PowerShell kullanmadan ilerletilmelidir; öncelikli kaynak Windows Media Session / SMTC helper olmalı, pencere başlığı sadece fallback olarak kalmalıdır.

## Teknik Yön

- PowerShell kullanılmaz.
- Yönetici gerektiren aygıt işlemleri PowerShell yerine Windows `ShellExecuteW` + `runas` ile başlatılır.
- Renderer sadece UI state ve etkileşimden sorumludur.
- Windows'a özel işlemler main process ve preload üzerinden güvenli IPC ile yapılır.
- Menü öğeleri veri tabanlı olmalıdır; HTML'e tek tek sabitlenmemelidir.
- Çentik dinamik davranış gösterecek şekilde durum makinesi mantığıyla geliştirilmelidir.
- Uygulama ayarları `userData/settings.json` altında kalıcı tutulur.
- Hızlı menü sırası `settings.json` içinde `appearance.menuOrder` olarak kalıcı tutulur.
- Özel tema renkleri `settings.json` içinde `appearance.customTheme` olarak kalıcı tutulur.
- Ayarlar görünümü çentiğin daha büyük bir uygulama paneline dönüşmesiyle açılır.

## Gelecek Özellikler

- Bildirim merkezi.
- Alarm kurma ve alarm bildirimleri.
- Sesli/asistan benzeri arama akışı.
- SMTC helper'ı self-contained/native dağıtıma yaklaştırmak.
- Oyun algılama, FPS, CPU/GPU sıcaklıkları için RTSS/PresentMon/LibreHardwareMonitor entegrasyonu.
