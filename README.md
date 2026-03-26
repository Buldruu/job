# JobHub Mongolia 🇲🇳

React + Firebase дээр суурилсан ажлын зах зээлийн платформ.

## Хуудасны бүтэц

| Хуудас | Зам | Тайлбар |
|--------|-----|---------|
| Нэвтрэх | `/login` | Email/password бүртгэл, нэвтрэлт |
| Нүүр | `/` | Цэсний товч холбоос |
| Ажил хайх | `/ajil` | Ажлын зарууд |
| Ажилтан хайх | `/ajiltan` | Ажилчдын зарууд |
| Дадлага | `/dadlaga` | Дадлагын зарууд |
| Сургалт | `/surgalt` | Сургалтын зарууд |
| Санхүү | `/sanhuu` | Үлдэгдэл, гүйлгээ, шилжүүлэг |
| Шилжүүлэг | `/sanhuu/shiljuuleg` | Шууд / Барилттай сонголт |
| Барилттай гүйлгээ | `/sanhuu/escrow/:id` | Гүйлгээний дэлгэрэнгүй |
| Профайл | `/profile` | Хувийн мэдээлэл |

## Firebase Тохиргоо

### 1. Firebase Console дээр шинэ project үүсгэнэ

### 2. `.env` файл үүсгэж тохиргоо оруулна:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

> Эсвэл `src/firebase.js` дотор шууд утгыг нь оруулна уу.

### 3. Authentication идэвхжүүлэх
Firebase Console → Authentication → Sign-in method → Email/Password → Enable

### 4. Firestore Database үүсгэх
Firebase Console → Firestore Database → Create database (Production mode)

### 5. Security rules байршуулах
```bash
firebase deploy --only firestore:rules
```

### 6. Indexes байршуулах
```bash
firebase deploy --only firestore:indexes
```

## Суулгах

```bash
npm install
npm run dev
```

## Барилттай шилжүүлэгийн урсгал

```
Илгээгч → Шилжүүлэг (барилттай) → Мөнгийг хасаж хадгална
                                         ↓
                              Хүлээн авагч ажлаа дуусгана
                                         ↓
                              "Ажлаа дуусгалаа" товч дарна
                                         ↓
                              Илгээгчид мэдэгдэл очно
                                         ↓
                              Илгээгч зөвшөөрвөл мөнгө шилжинэ
```

## Firestore Collections

- `users` — Хэрэглэгчийн профайл, үлдэгдэл
- `transactions` — Гүйлгээний түүх
- `escrows` — Барилттай шилжүүлэгүүд
- `jobs` — Ажлын зарууд
- `workers` — Ажилтны зарууд
- `internships` — Дадлагын зарууд
- `courses` — Сургалтын зарууд
