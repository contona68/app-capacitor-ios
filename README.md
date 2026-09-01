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
| CI | GitHub Actions روی `macos-latest` → فایل `.ipa` |

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

- Workflow: `.github/workflows/build-ipa.yml`
- Trigger: push به `main` / `beta` یا **Run workflow** دستی
- خروجی: Artifact با نام `hyperyek-ios-<branch>-<sha>.ipa`

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
