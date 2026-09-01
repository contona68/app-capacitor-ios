<div dir="rtl" align="right">

# HyperYek ViewApp — iOS

پوستهٔ iOS برای همان وب‌اپی که در [app-capacitor](https://github.com/contona68/app-capacitor) برای اندروید ساخته شده است.

**فاز ۱:** فقط یک WebView که `url.start` را لود می‌کند — بدون bridge native (SMS، biometric، push و …).

---

## معماری

```
کاربر → آیکون اپ → Capacitor WKWebView → www/index.html → redirect → url.start
```

| جزء | توضیح |
|-----|--------|
| فریم‌ورک | Capacitor 6 |
| کانفیگ | `developerConfigs/viewapp.config.json` |
| sync | `npm run sync:ios` |
| CI | GitHub Actions — Simulator (همیشه) + IPA (Self-hosted Mac) |

---

## خروجی روی GitHub — کدام مسیر؟

| مسیر | هزینه | خروجی | نصب روی iPhone |
|------|--------|--------|----------------|
| **Build iOS** (`build-ios.yml`) | رایگان | `.zip` Simulator | ❌ فقط Simulator |
| **Build iOS IPA (Self-hosted Mac)** | رایگان | `.ipa` | ✅ ~۷ روز (Apple ID رایگان) |
| **Build iOS IPA (Paid)** (`build-ipa.yml`) | ۹۹$/سال | `.ipa` | ✅ با secrets |

### مسیر پیشنهادی شما (رایگان + GitHub + iPhone)

1. یک **Mac** با Xcode
2. **Apple ID رایگان** در Xcode → Settings → Accounts
3. **Self-hosted runner** روی همان Mac
4. یک secret: `IOS_DEVELOPMENT_TEAM`

---

## راه‌اندازی Self-hosted Runner (Mac)

### ۱. Team ID را پیدا کنید

Xcode → **Settings → Accounts** → Apple ID → **Team ID** (مثلاً `A1B2C3D4E5`)

در GitHub repo → **Settings → Secrets → Actions**:
- Name: `IOS_DEVELOPMENT_TEAM`
- Value: همان Team ID

### ۲. Runner را روی Mac نصب کنید

GitHub repo → **Settings → Actions → Runners → New self-hosted runner** → macOS

دستورات GitHub را روی Mac اجرا کنید. هنگام config، **labels** را اضافه کنید:

```bash
./config.sh --url https://github.com/contona68/app-capacitor-ios --token TOKEN --labels macos,ios
```

Runner باید labels داشته باشد: `self-hosted`, `macos`, `ios`

### ۳. پیش‌نیاز Mac

- Xcode نصب باشد
- Apple ID در Xcode لاگین باشد
- Node.js 20، CocoaPods (`sudo gem install cocoapods`)
- گوشی تست (اختیاری برای اولین بار): یک‌بار از Xcode مستقیم Run بزنید تا trust برقرار شود

### ۴. اجرا

- **Actions → Build iOS IPA (Self-hosted Mac) → Run workflow**
- بعد از نصب runner می‌توانید trigger `push` را هم به workflow اضافه کنید
- خروجی: **Artifacts** → `hyperyek-ios-*.ipa`

---

## Build Simulator (بدون Mac — GitHub-hosted)

Workflow: **Build iOS** — روی هر push اجرا می‌شود، **بدون secret**.

- خروجی: `hyperyek-ios-simulator-*.zip`
- فقط روی Simulator Mac باز می‌شود (برای تست compile)

---

## تنظیم آدرس وب

فایل `developerConfigs/viewapp.config.json` را ویرایش کنید:

```json
"url": {
  "start": "https://dev.hyperyek.com/app/hyperyek-general/store/#/login"
}
```

سپس:

```bash
npm run sync:config
```

---

## پیش‌نیاز نصب روی iPhone واقعی

برخلاف APK دیباگ اندروید، **iOS بدون امضای Apple روی گوشی نصب نمی‌شود.**

| مورد | الزام |
|------|--------|
| Apple Developer Program | ~۹۹ دلار/سال |
| Certificate (Development) | از [developer.apple.com](https://developer.apple.com) |
| Provisioning Profile (Development) | با Bundle ID = `com.hyperyek.app` |
| ثبت UDID دستگاه | در پروفایل development |

### مراحل در Apple Developer

1. **Identifiers** → App ID با Bundle ID: `com.hyperyek.app`
2. **Devices** → UDID هر iPhone تست را اضافه کنید  
   (UDID را از Finder/Xcode وقتی گوشی وصل است ببینید)
3. **Certificates** → Apple Development certificate بسازید و `.p12` export کنید
4. **Profiles** → iOS App Development profile برای همان App ID + دستگاه‌ها

---

## راه‌اندازی GitHub Secrets

در repo → **Settings → Secrets and variables → Actions** این secretها را بگذارید:

| Secret | مقدار |
|--------|--------|
| `IOS_BUILD_CERTIFICATE_BASE64` | فایل `.p12` به صورت base64 |
| `IOS_P12_PASSWORD` | رمز export فایل p12 |
| `IOS_PROVISIONING_PROFILE_BASE64` | فایل `.mobileprovision` به صورت base64 |
| `IOS_KEYCHAIN_PASSWORD` | یک رشته تصادفی (فقط برای CI) |
| `IOS_DEVELOPMENT_TEAM` | Team ID (مثلاً `AB12CD34EF`) |
| `IOS_PROVISIONING_PROFILE_NAME` | نام دقیق پروفایل در Apple Developer |
| `IOS_CODE_SIGN_IDENTITY` | اختیاری — پیش‌فرض: `Apple Development` |

### تولید base64 (PowerShell)

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\cert.p12"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\profile.mobileprovision"))
```

---

## Build در GitHub Actions

| Workflow | Trigger | Secret لازم |
|----------|---------|-------------|
| `build-ios.yml` | push / manual | — |
| `build-ipa-self-hosted.yml` | push / manual | `IOS_DEVELOPMENT_TEAM` |
| `build-ipa.yml` | manual فقط | ۶ secret (حساب پولی) |

---

## نصب IPA روی iPhone

1. از تب **Actions** آخرین run موفق → **Artifacts** → IPA را دانلود کنید.
2. **روش A — Mac + Xcode:** گوشی را وصل کنید → Window → Devices and Simulators → Install app
3. **روش B — Apple Configurator:** IPA را روی دستگاه بکشید.
4. **روش C — ابزار CLI:** `ios-deploy` یا سرویس‌های توزیع داخلی (مثلاً Diawi) — فقط برای تیم خودتان.

> **محدودیت development:** پروفایل ~۷ روز اعتبار دارد؛ بعد از expiry باید پروفایل را renew و دوباره build بگیرید. برای توزیع گسترده‌تر بعداً TestFlight یا Ad-Hoc را در نظر بگیرید.

---

## توسعه محلی (فقط macOS)

```bash
npm install
npm run sync:ios
cd ios/App && pod install && cd ../..
npx cap open ios
```

در Xcode با Team خود sign کنید و روی دستگاه Run بزنید.

---

## تفاوت با پروژه اندروید

| | Android (`app-capacitor`) | iOS (این repo) |
|--|---------------------------|----------------|
| Bridge native | ✅ SMS, biometric, push, … | ❌ فاز ۱ — فقط WebView |
| CI runner | `ubuntu-latest` | `macos-latest` |
| خروجی | APK debug | IPA development (signed) |
| نصب بدون حساب Apple | ممکن (debug APK) | **غیرممکن** |

---

## دستورها

```bash
npm run sync:config    # فقط sync کانفیگ + www
npm run sync:ios       # sync + cap add/sync ios
```

</div>
