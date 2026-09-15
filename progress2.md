# Progress

Son güncelleme: 2026-05-15

Bu dosya, proje ilerlemesini faz bazlı takip etmek için ana pano olarak kullanılır.
Görev numaraları `memory-bank` içindeki notlarla hizalanmıştır.

Durum anahtarı:
- [ ] Bekliyor
- [-] Aktif çalışma
- [~] Kısmen tamamlandı / tekrar test gerekli
- [x] Tamamlandı

## Çalışma Kuralları

- Her görev sonrası kod tekrar okunacak ve regresyon kontrolü yapılacak.
- Her görev için `memory-bank/` altında değişiklik notu tutulacak.
- Gerekirse `memory-bank/ideas/` altında fikir ve sonraki adım notları tutulacak.
- Faz kapatılmadan önce mümkünse kısa smoke test yapılacak.


## Faz 0 - Planlama ve Takip

- [x] `progress.md` oluşturuldu
- [x] Fazlar `memory-bank` notlarına göre yeniden hizalandı
- [x] Tamamlanan / açık fazlar ayrıştırıldı

## Faz 1 

Durum: [x]

Yapılacaklar:
- [x] İlk önce backup al. Bu projenin bütün dosylaarını başka bir klasöre kopyala
- [x] Ayarlar kısmında bir ayar olacak. Bu ayar şu olacak. Uygulamanın ayarları uygulama üstünden mi yoksa ayrı bir pencere olarak mı açılacağına karar verebilecek. Şuan uygulama içinde açılıyor.
- [x] Ses mikseri yenileme butonunu header kısmında Ses mikseri ve uygulama bazlı ses yazan kısma sadece ikon ve buton olacak şekilde ekle en sağ tarafında dursun
- [x] Ana menüden harici uygulamalar ikonunu kaldır sadece ayarlarda gözükecek.
- [x] Ayarlar giriş görünüm kısmında yeni görünümler koyalım.
- [x] Ayarlar Harici uygulamalar kısmında uygulamalar için şöyle bir fikrim var nasıl yapılır yapılabilir mi bilmiyorum. Bu konuda bilgilendir. Mesela bazılarında Bağla diye bir buton olacak. Örnek olarak Discord üzerinden örnek vereyim. Mesela discord hesabımı bu uygulama ile bağladım diyelim. Bağladıktan sonra bazı ayarlar olacak. Mesela ;

* Dmden bana mesaj yazılırsa,
* Şu sunucudan mesaj gelirse
* Belirli sunucudan beni etiketlerse
* Her sunucu için beni etiketlerse
* Biri discorddan biri ararsa

Gibi gibi senaryolarda, 

github için belli zaten, 
youtube için

* Videon kanal yüklendi
* Şu kişi yorumunu beğendi
* Şu kişi kanalınızı takip etti

gibi mesajları uygulama kayar yazı şeklinde gösterecek. (saat ve tarih olan yerde) Ve mesajların rengini ayarlayabileceğiz. Atıyorum discorddan mesaj gelirse bizim siyah menü discordun rengine bürünebilir kullanıcının tercihine göre.

Uygulamalar bağlandıktan sonra Bağla butonu Bağlandı gibi isim alacak. Soluna çark işareti gelecek ve bastığımda bir modal açılacak. Bu modalda sana dediğim renk ve tetikleyicileri yani dmden mesaj yazılırsa diye yazdığım şeyleri o modaldan düzenleyebileceğiz.

Açık maddeler:
- [x] Yedek klasörü: `C:\Users\talba\Desktop\gdf-backup-20260515-215746`
- [~] Harici uygulamalar şimdilik komple devre dışı bırakıldı; kod duruyor ama ayarlarda gösterilmiyor ve arka plan polling çalışmıyor.

Kapanış kriteri:
- [x] Uygulama ayarları overlay veya ayrı pencere olarak açılabiliyor.
- [~] Harici uygulamalar ana menüden ve ayarlardan kaldırıldı; daha sonra tekrar ele alınacak.
- [x] Ses mikseri yenileme düğmesi ikon-only hale getirildi.

## Faz 2

Durum: [x]

Yapılacaklar:
- [x] Giriş kısmındaki Kontrol merkezi yazan cardı tamamen kaldıralım. Genel kısım Dil kısmı ile başlasın.
- [x] Giriş kısmındaki Tema kısmındaki özelleştir butonunu kutucuğunun ortasına getir.
- [x] Hakkında kısmını https://hizliresim.com/6sbl4r9 bu linkteki gibi yap.
- [x] Ayarlarda mevcut mikrofonu ve kamerayı seçebileceğimiz yer koymalısın.
- [x] Bu ekran içinde ekran menüsü var ya youtubedeki veya başka platformlardaki videoları uygulama içinde oynatma niyetim var. açıp kapatılabilir olacak. Video arka planda oynatılmaya devam edecek mesela, ben oyun veya iş sırasında page down ve page up butonlarıyla ya da kullanıcıların ayarladığı başka tuşlarla o menüyü açıp kapatabileceğim. İstersem videonun boyutunu uygulama içinden büyütebileceğim gibi bir fikrim var.

Açık maddeler:
- [x] Ekran içi video penceresi URL, boyut ve PageUp/PageDown kısayol ayarlarıyla eklendi.
- [x] Mikrofon/kamera cihaz seçimi gizlilik bölümüne eklendi.

Kapanış kriteri:
- [x] Giriş başlığı güncellendi.
- [x] Tema özelleştir düğmesi ikon-only oldu.
- [x] Video penceresi ayarlardan açılıp kapatılabiliyor.

## Faz 3

Durum: [x]

Yapılacaklar:
- [x] Pomodoro zamanlayici başlatıldığında tarih ve saat olan kısımda tarih ve saat görünmez olacak sadece pomodoro sayacı olacak.
- [x] Not alma menüsü ekle
- [x] Ayarlar kısmına bu ana kısımda sadece tarih ve saat olan kısımdaki içerikleri değiştirebileceğimiz bir menü koyalım.
- [x] Indirme hizi menüsü olsun ama bu ayarlardan açılır olması lazım. Ayarlardan açıldıktan sonra indirme hızını saat ve tarih bölümüne ek olarak ekleyebileceğiz. aynı şekilde Internet ping testi. Bu kısmı yukarıda yazdığım ayarlar kısmına ekleyelim.
- [x] Kulaklik pil seviyesi gösteren menü de olacak. Bu kısmı yukarıda yazdığım ayarlar kısmına ekleyelim.

Kapanış kriteri:
- [x] Pomodoro ve Notlar hızlı menüleri çalışıyor.
- [x] Ana saat alanı Pomodoro veya Saat/Tarih olarak değiştirilebiliyor.
- [x] İndirme hızı, ping ve kulaklık pil seçenekleri içerik ayarlarına eklendi.

## Faz 4 

Durum: [x]

Yapılacaklar:
- [x] idea klasörüne ayarlaridea.md ayarlar için önerebileceğin 100 özellik ekle
- [x] idea klasörüne menuidea.md menüler için önerebileceğin 100 fikir
- [x] idea klasörüne socialidea.md harici uygulamalar için önerebileceğin 100 fikir (benim yazdığım gibi uygulama ismi ve ne veri çekebileceğimiz gibi.)
- [x] idea klasörüne güvenlik, iyileştirme ve optimizasyon için fikirler yaz

Açık maddeler:
- [x] `idea/ayarlaridea.md`
- [x] `idea/menuidea.md`
- [x] `idea/socialidea.md`
- [x] `idea/guvenlik-iyilestirme-optimizasyon.md`

Kapanış kriteri:
- [x] Dört fikir dosyası oluşturuldu.
- [x] Memory-bank faz notları eklendi.

## Faz 5

Durum: [~]

Yapılacaklar:
- [ ] 
- [ ] 
- [ ] 

Açık maddeler:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 

## Faz 6 

Durum: [ ]

Yapılacaklar:
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 
- [ ] 

## Faz 7 

Durum: [ ]

Yapılacaklar:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Açık maddeler:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 
- [ ] 

## Faz 8 

Durum: [ ]

Yapılacaklar:
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Açık maddeler:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 
- [ ] 

## Faz 9 

Durum: []

Yapılacaklar:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Açık maddeler:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 
- [ ] 

## Faz 10

Durum: [ ]

Yapılacaklar:
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 

## Faz 11 

Durum: [ ]

Açık maddeler:
- [ ] 
- [ ] 
- [ ] 
- [ ] 

Kapanış kriteri:
- [ ] 
- [ ] 

## Öncelikli Sıra

Önerilen çalışma sırası:




## Hızlı Komutlar

Bana şu şekilde görev verebilirsin:

`Discord/GitHub/YouTube gerçek OAuth entegrasyonu için teknik tasarım çıkar.`
