# 🔥 HAGA Firebase Setup Guide

Бүх Firebase-ийн тохиргоо, security rules, indexes, болон хийх ёстой бүх зүйлийн дэлгэрэнгүй заавар.

---

## 📋 Агуулга

1. [Firebase Project үүсгэх](#1-firebase-project-үүсгэх)
2. [Authentication тохируулах](#2-authentication-тохируулах)
3. [Firestore Database үүсгэх](#3-firestore-database-үүсгэх)
4. [Firestore Security Rules](#4-firestore-security-rules)
5. [Firestore Indexes](#5-firestore-indexes)
6. [Storage тохируулах](#6-storage-тохируулах)
7. [Storage Security Rules](#7-storage-security-rules)
8. [Environment Variables](#8-environment-variables)
9. [Collections Schema](#9-collections-schema)
10. [Admin хэрэглэгч үүсгэх](#10-admin-хэрэглэгч-үүсгэх)

---

## 1. Firebase Project үүсгэх

1. [console.firebase.google.com](https://console.firebase.google.com) орно
2. **Add project** дарж шинэ проект үүсгэнэ:
   - Project name: `jobhub-c671c` (одоо ашиглагдаж байгаа)
3. Google Analytics дэмжих эсэхийг сонгоно (заавал биш)

---

## 2. Authentication тохируулах

### 2.1 Sign-in methods идэвхжүүлэх

```
Console → Authentication → Sign-in method
```

Дараах providers идэвхжүүлнэ:

| Provider     | Тохиргоо                                                |
|--------------|---------------------------------------------------------|
| Email/Password | Enable                                                 |
| Google       | Enable + Project support email сонгоно                  |
| Phone        | Enable + Test phone numbers нэмж болно                  |
| Facebook     | (Optional) App ID + App Secret хэрэгтэй                 |

### 2.2 Authorized domains нэмэх

```
Authentication → Settings → Authorized domains → Add domain
```

```
buldruu.github.io
localhost
jobhub-c671c.firebaseapp.com  (өгөгдмөл)
jobhub-c671c.web.app          (өгөгдмөл)
```

### 2.3 Phone Auth тохируулах

```
Authentication → Sign-in method → Phone → Settings
```

- reCAPTCHA автоматаар тохирно
- Test phone numbers нэмэх боломжтой (development үед)

---

## 3. Firestore Database үүсгэх

### 3.1 Database үүсгэх

```
Console → Firestore Database → Create database
```

- Location: **asia-east1** (Mongolia-д ойр)
- Mode: **Production mode** (rules-аар хамгаалагдсан)

### 3.2 Collections үүсгэх

Дараах collections автоматаар үүснэ (хэрэглэгчид зар тавихад). Гэхдээ гараар үүсгэж болно:

| Collection      | Зорилго                                        |
|-----------------|------------------------------------------------|
| `users`         | Хэрэглэгчийн профайл                           |
| `workers`       | Ажлын зар (хувь хүн / байгуулга)              |
| `jobs`          | Ажил хайгчдын профайл                          |
| `internships`   | Дадлагын зар                                   |
| `transactions`  | Төлбөрийн түүх                                 |
| `escrows`       | Эскроу гүйлгээнүүд                             |
| `notifications` | Мэдэгдлийн систем                              |
| `chats`         | Чат өрөөнүүд                                   |
| `chats/{id}/messages` | Зурвасууд (subcollection)                 |
| `presence`      | Online status                                  |
| `settings`      | Системийн тохиргоо (зөвхөн admin)              |

---

## 4. Firestore Security Rules

```
Console → Firestore Database → Rules → Replace below → Publish
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Users ── 
    // Бүх нэвтэрсэн хэрэглэгч read хийж болно
    // Зөвхөн өөрийн document, эсвэл admin бичиж болно
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }

    // ── Transactions ──
    // Зөвхөн өөрийн гүйлгээг харна
    // Засах боломжгүй (зөвхөн create + read)
    match /transactions/{id} {
      allow read: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // ── Escrows ──
    match /escrows/{id} {
      allow read, update: if request.auth != null &&
        (resource.data.fromUid == request.auth.uid || resource.data.toUid == request.auth.uid);
      allow create: if request.auth != null;
      allow delete: if false;
    }

    // ── Public job listings ──
    // Бүх нэвтэрсэн хэрэглэгч read/write
    match /workers/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /jobs/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /internships/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // ── Presence (online status) ──
    match /presence/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    // ── Settings (Admin only write) ──
    match /settings/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // ── Notifications ──
    match /notifications/{id} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.uid;
    }

    // ── Chats ──
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
    }

    match /chats/{chatId}/messages/{msgId} {
      allow read, write: if request.auth != null;
    }

    // ── Reports (хэрэглэгчийн гомдол) ──
    match /reports/{id} {
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true ||
        resource.data.reporterUid == request.auth.uid
      );
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

  }
}
```

---

## 5. Firestore Indexes

Зарим query-нүүд composite index шаардлагатай. Доорхыг гараар нэмэх эсвэл алдаа гарахад Firebase Console-оос автоматаар санал болгох link дарна.

```
Console → Firestore Database → Indexes → Composite → Add index
```

### Шаардлагатай indexes:

| Collection      | Fields                                          |
|-----------------|--------------------------------------------------|
| `workers`       | `featured ↑` + `featuredAt ↓` + `__name__ ↓`    |
| `workers`       | `uid ↑` + `createdAt ↓` + `__name__ ↓`          |
| `jobs`          | `featured ↑` + `featuredAt ↓` + `__name__ ↓`    |
| `jobs`          | `uid ↑` + `createdAt ↓` + `__name__ ↓`          |
| `internships`   | `featured ↑` + `featuredAt ↓` + `__name__ ↓`    |
| `transactions`  | `uid ↑` + `createdAt ↓` + `__name__ ↓`          |
| `notifications` | `uid ↑` + `read ↑` (single-field, automatic)    |
| `chats`         | `members ↑` (array) + `lastMsgAt ↓`             |

> 💡 **Зөвлөмж**: Алдаа гарахад Firebase Console-д index-ийн URL-тэй log харагдана. Тэр URL-г дарвал автоматаар индекс үүсгэх боломжтой.

---

## 6. Storage тохируулах

```
Console → Storage → Get started
```

- Location: **asia-east1**
- Bucket: `jobhub-c671c.firebasestorage.app`

### Folder structure:

```
gs://jobhub-c671c.firebasestorage.app/
├── workers/{uid}/        # Ажлын зарын зураг, видео
│   ├── photo_*.jpg
│   └── video_*.mp4
├── cvs/{uid}/             # CV файлууд
├── portfolio/{uid}/       # Хийсэн ажлын зургууд
├── posts/{uid}/           # Захиалгын зургууд
└── profile/{uid}/         # Профайл зургууд
```

---

## 7. Storage Security Rules

```
Console → Storage → Rules → Replace below → Publish
```

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Бүх нэвтэрсэн хэрэглэгч уншиж болно
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }

    // Зөвхөн өөрийн folder-т бичиж болно
    match /workers/{uid}/{file} {
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 50 * 1024 * 1024  // 50MB max
        && request.resource.contentType.matches('image/.*|video/.*');
    }

    match /cvs/{uid}/{file} {
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 10 * 1024 * 1024;  // 10MB max
    }

    match /portfolio/{uid}/{file} {
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /posts/{uid}/{file} {
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /profile/{uid}/{file} {
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

  }
}
```

---

## 8. Environment Variables

### Local development (.env файл)

Проектын root дотор `.env` файл үүсгэж дараахыг бичнэ:

```
VITE_FIREBASE_API_KEY=AIzaSyAf42ijDzYJEh0cC8-L-6AoVTws49yXQI4
VITE_FIREBASE_AUTH_DOMAIN=jobhub-c671c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobhub-c671c
VITE_FIREBASE_STORAGE_BUCKET=jobhub-c671c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=629971119042
VITE_FIREBASE_APP_ID=1:629971119042:web:f8d0a5626f0c810a2e445b
VITE_GOOGLE_MAPS_KEY=AIzaSyDk0WluI-wQaH9F5xnvHvfGHdelP__VQ64
```

### GitHub Secrets (Production)

```
GitHub repo → Settings → Secrets and variables → Actions → New secret
```

Дээрх бүх variables-г Secret хэлбэрээр нэмнэ (`VITE_` prefix-тэй ижил нэрээр).

---

## 9. Collections Schema

### `users` collection

```javascript
{
  ovog: string,              // Овог
  ner: string,               // Нэр
  email: string,
  utas: string,              // Утасны дугаар
  photoURL: string,
  chiglel: string,           // Чиглэл (мэргэжил)
  chiglel_main: string,      // Том ангилал
  chadvar: string,           // Чадвар
  turshlaga: string,         // Туршлагын жил
  tsalin: string,            // Үйлчилгээний төлбөр
  hayg: string,              // Хаяг
  nemelt: string,            // Нэмэлт тайлбар
  portfolio: string[],       // Хийсэн ажлын зургууд (URLs)
  balance: number,           // Үлдэгдэл
  premiumPlan: 'free'|'pro',
  premiumUntil: Timestamp,
  isAdmin: boolean,
  zovshoorol: boolean,       // DAN баталгаажилт
  createdAt: Timestamp,
}
```

### `workers` collection (ажлын зар)

```javascript
{
  zarlagch_turul: 'Байгуулга' | 'Хувь хүн',
  hiilgeh_ajil: string,      // Ажлын нэр
  alban_tushaal: string,     // Албан тушаал (байгуулгын хувьд)
  baiguulgiin_ner: string,
  tailbar: string,           // Тайлбар
  chiglel: string,
  chiglel_main: string,
  hayg: string,
  lat: number, lng: number,  // Газрын зургийн координат
  tsalin: string,
  hugatsaa: string,          // Хугацаа
  budget: string,            // Төсвийн хэмжээ
  photo_urls: string[],
  video_intro: string,
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled' | 'expired',
  uid: string,
  email: string,
  ratings: number[],
  featured: boolean,
  featuredAt: Timestamp,
  createdAt: Timestamp,
}
```

### `chats` collection

```javascript
{
  members: [uid1, uid2],
  jobTitle: string,
  lastMsg: string,
  lastMsgAt: Timestamp,
  unread: { [uid]: number },
  createdAt: Timestamp,
}
```

### `chats/{id}/messages` subcollection

```javascript
{
  uid: string,
  type: 'text' | 'offer',
  text: string,              // type='text' үед
  offerAmount: number,       // type='offer' үед
  offerNote: string,
  offerStatus: 'pending' | 'accepted' | 'declined',
  createdAt: Timestamp,
}
```

### `notifications` collection

```javascript
{
  uid: string,
  type: 'sanal' | 'urilt' | 'payment' | 'rating' | 'premium' | 'verified' | 'system',
  title: string,
  body: string,
  read: boolean,
  createdAt: Timestamp,
}
```

### `transactions` collection

```javascript
{
  uid: string,
  type: 'orlogo' | 'zarlaga',
  amount: number,
  note: string,
  fromAdmin: boolean,
  adminUid: string,
  createdAt: Timestamp,
}
```

---

## 10. Admin хэрэглэгч үүсгэх

Эхний admin-г Firebase Console-ээс гараар тохируулна:

1. Хэрэглэгч аппд бүртгүүлсэн байх
2. `Firestore → users → {таны_uid}` document руу ор
3. **+ Add field** дарна:
   ```
   Field:  isAdmin
   Type:   boolean
   Value:  true
   ```
4. **Save** дарна

Дараа нь тухайн хэрэглэгч аппд нэвтрэхэд **Admin цэс** идэвхжинэ.

---

## ✅ Шалгах жагсаалт

Бүх алхмыг дуусгасны дараа дараахыг шалгана:

- [ ] Firebase Auth-д Email + Google + Phone идэвхжсэн
- [ ] `buldruu.github.io` Authorized domains-д нэмэгдсэн
- [ ] Firestore Database үүсгэгдсэн (asia-east1)
- [ ] Firestore Rules publish хийгдсэн
- [ ] Шаардлагатай indexes үүсгэсэн (эсвэл алдаа гарахад үүсгэнэ)
- [ ] Storage идэвхжсэн (asia-east1)
- [ ] Storage Rules publish хийгдсэн
- [ ] `.env` файл байгаа эсвэл GitHub Secrets тохируулсан
- [ ] Эхний admin хэрэглэгч `isAdmin:true` тохируулсан
- [ ] Google Maps API key Application restrictions хийсэн

---

## 🛠 Алдаа гарвал

**"Missing or insufficient permissions"** → Firestore Rules алдаатай байна. Дээрхээс хуулна уу.

**Composite index error** → Алдааны URL-г дарж индекс автоматаар үүсгэнэ үү.

**reCAPTCHA error** → Phone Auth-д `localhost` болон `buldruu.github.io` нэмсэн эсэхийг шалгана.

**Storage upload fail** → Storage Rules-д `request.resource.size` лимит зөв байгаа эсэхийг шалгана.

---
