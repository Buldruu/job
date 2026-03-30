# Haga 🇲🇳

React + Firebase дээр суурилсан ажлын зах зээлийн платформ.

## Тохируулах

### 1. Репо clone хийх
```bash
git clone https://github.com/Buldruu/job.git
cd job
npm install
```

### 2. Firebase тохиргоо
`.env.example` файлыг хуулж `.env` нэртэй файл үүсгэнэ:
```bash
cp .env.example .env
```

`.env` файлд өөрийн Firebase утгуудыг оруулна:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Firebase Console → Project Settings → Your apps → Web app → firebaseConfig

### 3. Firebase дээр идэвхжүүлэх
- **Authentication** → Sign-in method → Email/Password → Enable
- **Firestore Database** → Create database (Production mode)
- Security rules байршуулах:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Ажиллуулах
```bash
npm run dev
```

---

## Хуудасны бүтэц

| Хуудас | Тайлбар |
|--------|---------|
| `/login` | Нэвтрэх / Бүртгүүлэх / Нууц үг сэргээх |
| `/` | Нүүр цэс |
| `/ajil` | Ажлын зарууд |
| `/ajiltan` | Ажилтны зарууд |
| `/dadlaga` | Дадлагын зарууд |
| `/surgalt` | Сургалтын зарууд |
| `/sanhuu` | Санхүү — үлдэгдэл, гүйлгээ |
| `/sanhuu/shiljuuleg` | Шууд / Барилттай шилжүүлэг |
| `/sanhuu/escrow/:id` | Барилттай гүйлгээний дэлгэрэнгүй |
| `/profile` | Профайл засах |

## Барилттай шилжүүлэгийн урсгал
```
Илгээгч шилжүүлэх → мөнгийг хасч хадгална 🔒
     ↓
Хүлээн авагч "Ажлаа дуусгалаа" дарна
     ↓
Илгээгч мэдэгдэл авна, зөвшөөрнө
     ↓
Мөнгө хүлээн авагчид шилжинэ ✅
```
