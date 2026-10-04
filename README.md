# Zinciri Kırma

Karanlık temalı, mobil ekrana oturan bir **Don't Break the Chain** alışkanlık uygulaması. Vite, React, TypeScript ve Tailwind CSS ile yazıldı. Sunucu yok: bütün seriler tarayıcının `localStorage` alanında durur. Yönlendirme hash tabanlıdır (`#/`), bu yüzden GitHub Pages derin linklerde 404 üretmez.

Örnek adresler:

- Dashboard: `https://kullaniciadi.github.io/repo-adi/#/`
- Seri: `https://kullaniciadi.github.io/repo-adi/#/dis-fircalama`

## Özellikler

- Dashboard'da bütün seriler kart olarak listelenir. Kartta ad, tür, `🔥 14 Gün` sayacı ve son 7 günün mini zinciri vardır.
- Yeni seri, alttaki **+ Yeni Seri Ekle** düğmesiyle açılan formdan eklenir. Başlık yazıldıkça `slug` üretilir.
- Seri sayfası (`#/:slug`) doğrudan açılabilir. Solda Dashboard'a dönüş, ortada büyük seri sayacı, altta etkileşimli ay takvimi vardır.
- Üç işaretleme kipi: günlük 1×, günlük 2×, haftalık kota.
- Bugün dahil son 7 gün düzenlenebilir. Daha eski günler kilitlenir.
- Seri, kilitlenmiş boş bir günde kesilir. Tolerans penceresindeki boşluklar zinciri hemen sıfırlamaz.

## Teknolojiler

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- [React Router](https://reactrouter.com/) `HashRouter`
- `localStorage` (anahtar: `zinciri-kirma.habits`)
- Vitest, kural testleri için
- `gh-pages`, statik `dist/` klasörünü yayınlamak için

## Başlarken

```bash
npm install
npm run dev
```

Geliştirme sunucusu `http://localhost:5173/#/` adresini açar. Üretim derlemesi ve önizleme:

```bash
npm run build
npm run preview
npm test
```

## Proje yapısı

```
ZinciriKırma/
├── index.html                 # lang=tr, tema rengi, yazı tipleri, %BASE_URL% favicon
├── vite.config.ts             # base: './'  → GitHub Pages'te kırılmayan asset yolları
├── vitest.config.ts
├── package.json               # dev, build, test, deploy
├── public/
│   ├── favicon.svg
│   └── .nojekyll              # GitHub Pages'in alt çizgili dosyaları yutmasını engeller
└── src/
    ├── main.tsx               # React kökü
    ├── App.tsx                # HashRouter + sayfa rotaları
    ├── index.css              # Tailwind, takvim hücresi, zincir çizgisi, nabız
    ├── types.ts               # Habit veri modeli
    ├── components/
    │   ├── Dashboard.tsx      # #/  kart listesi ve yeni seri düğmesi
    │   ├── HabitDetail.tsx    # #/:slug  sayaç, ay gezgini, silme
    │   ├── HabitCard.tsx
    │   ├── NewHabitModal.tsx  # başlık, tür, haftalık kota, slug
    │   ├── Calendar.tsx       # ay ızgarası
    │   ├── DayCell.tsx        # tek gün: X / eğik çizgi / kilit / nabız
    │   ├── MiniChain.tsx      # karttaki son 7 gün
    │   ├── ChainMark.tsx      # kalın SVG çapraz
    │   ├── NotFound.tsx
    │   └── Page.tsx           # güvenli alan (çentik) boşlukları
    ├── context/
    │   ├── HabitsProvider.tsx # state + localStorage
    │   ├── habits-context.ts
    │   └── useHabits.ts
    ├── hooks/
    │   ├── useToday.ts
    │   └── usePageTitle.ts
    └── lib/
        ├── dates.ts           # yerel takvim, Pazartesi başlangıcı, 7 gün penceresi
        ├── dayState.ts        # işaret, kota, tıklama döngüsü
        ├── streak.ts          # seri hesabı
        ├── habits.ts          # oluşturma ve kayıt normalleştirme
        ├── slug.ts
        ├── storage.ts
        └── logic.test.ts
```

Arayüz `430px` sütunda ortalanır. Telefonda kenardan kenara durur; geniş ekranda aynı sütun siyah zeminin ortasında kalır. Üst ve alt boşluklar `env(safe-area-inset-*)` ile iPhone çentiğine ve home göstergesine bırakılır.

## Rotalar

`HashRouter` kullanıldığı için sunucu yalnızca `index.html` görür. `#/` sonrasını tarayıcı çözer.

| Adres | Ekran |
| --- | --- |
| `#/` | Dashboard |
| `#/:slug` | O slug'a ait seri. Örnek: `#/dis-fircalama` |
| diğer | Bulunamadı |

Slug, başlıktan üretilir: Türkçe karakterler sadeleşir, boşluklar `-` olur (`Diş Fırçalama` → `dis-fircalama`). Çakışırsa `-2`, `-3` eklenir. Formda adres elle de değiştirilebilir.

Seri bu tarayıcıda kayıtlı değilse (başka telefon, gizli pencere, temizlenmiş depo) aynı hash açılır ama takvim gelmez. Veri hesaba bağlı değildir.

## Veri modeli

```ts
export type HabitType = 'daily' | 'weekly'

export interface Habit {
  id: string
  title: string
  slug: string
  type: HabitType
  targetCount: number // günlük 1 veya 2, ya da haftada X gün
  history: Record<string, number> // "YYYY-MM-DD": 1 veya 2
  createdAt: string
}
```

`history` değerleri:

| Tür | `1` | `2` |
| --- | --- | --- |
| Günlük 1× | Tamamlandı, **X** | — |
| Günlük 2× | Eğik çizgi `/` | Tamamlandı, **X** |
| Haftalık | O gün işaretlendi | İşaretle aynı, `1`'e indirgenir |

Tarih anahtarları kullanıcının yerel günüdür, UTC değildir. Böylece gece yarısına yakın saatlerde gün kayması olmaz.

## İşaretleme

Hücreye basınca `active:scale-95` ile hafifçe yaylanır. Bugünün hücresinde amber bir nabız vardır. İşaret, kalın SVG çizgidir; düz metin `X` değildir.

### Günlük 1×

1. dokunuş **X** basar. 2. dokunuş temizler. X olan gün zincire girer.

### Günlük 2×

1. dokunuş `/` (sabah). 2. dokunuş ikinci çizgiyi ekler, **X** olur. 3. dokunuş sıfırlar. Yalnızca **X** zincire bağlanır; `/` ara durumdur.

### Haftalık kota

Hedef, haftada 1–7 gündür. Hafta **Pazartesi başlar, Pazar biter**. İşaretlenen gün `/` olarak durur. İşaret sayısı hedefe ulaştığı anda (Pazar'ı beklemeden) o haftanın yedi günü birden **X** olur ve aynı satırda zincir çizgisiyle kenetlenir: `X X X X X X X`.

Hedefe sayılmayan günler de bu blokta X görünür. Hücrenin altındaki küçük nokta, o günü senin işaretlediğini ayırır; noktasız X kotayla tamamlanmıştır. Noktalı bir günü tolerans penceresindeyken geri alırsan ve sayı hedefin altına düşerse blok açılır.

Gelecek günler tıklanamaz. Kota bu hafta dolduysa onlar da görsel olarak X'tir; seri sayacına, o gün yaşandığında eklenirler.

## Yedi gün ve seri

Düzenlenebilir aralık: **bugün ve önceki 6 gün**. Daha eski hücreler `pointer-events-none` ile kilitlenir, soluk çizilir ve değişmez.

Seri, bugünden geriye doğru sayılır:

1. Zincire bağlı bir gün sayacı artırır.
2. Tolerans penceresindeki boş gün atlanır. Seriyi büyütmez, koparmaz da. O gün hâlâ telafi edilebilir.
3. Pencereden eski ve boş bir gün zinciri orada keser. Daha gerideki tamamlanmış günler sayılmaz.

Bugün henüz işaretli değilse seri sıfırlanmaz; bugün de pencerenin içindedir.

Haftalık seride bağlanan gün, kotası dolmuş haftanın bugün ve geçmişindeki günleridir. İki dolu hafta `🔥 14 Gün` eder. İçinde hâlâ telafi şansı olan eksik bir hafta, gerideki dolu haftayı hemen silmez.

## Görsel dil

Zemin siyahtır. Kartlar `bg-zinc-900/80`, `border-zinc-800` ve `backdrop-blur`. Vurgu kehribar / amber: tamamlanan hücrenin iç ışıması, SVG üzerindeki neon gölge ve hücreler arasındaki zincir çizgisi. Yazılar Outfit, büyük sayaç Instrument Serif.

Takvim satırı Pazartesi'den Pazar'a dizilir (`Pt Sa Ça Pe Cu Ct Pz`). Aynı satırda art arda gelen X'lerin arasından amber bir çizgi geçer. Pazar ile sonraki Pazartesi alt satıra kırıldığı için çizgi satır sonunda durur; sayaç haftalar arasında yürümeye devam eder.

## GitHub Pages

`vite.config.ts` içinde `base: './'` görecelidir. Depo adı değişse de `./assets/...` yolları bozulmaz. `public/.nojekyll`, Pages'in `_` ile başlayan Vite dosyalarını atlamasını engeller.

İlk yayın:

```bash
git init
git add .
git commit -m "Zinciri Kırma ilk sürüm"
git branch -M main
git remote add origin git@github.com:KULLANICI/REPO.git
git push -u origin main
npm run deploy
```

`deploy`, `npm run build` çalıştırır ve `dist/` klasörünü `gh-pages` dalına yollar. Ardından repoda **Settings → Pages → Branch: `gh-pages` / root**. Birkaç dakika sonra site `https://KULLANICI.github.io/REPO/#/` adresindedir.

Özel alan adı kullanılıyorsa `base: './'` yine geçerlidir. Hash olduğu için ayrıca `404.html` yönlendirmesi gerekmez.

## Test

`src/lib/logic.test.ts` şunları kilitler: Türkçe slug, 1× / 2× döngüsü, geleceğe ve kilitli güne yazamama, 7 günlük tolerans, kilitli boş günde kopma, haftalık kotanın yedi günü X yapması ve o bloktaki zincir çizgisinin Pazar'da satır sonunda durması.

```bash
npm test
```
