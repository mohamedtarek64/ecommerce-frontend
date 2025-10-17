# 🚀 Frontend Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- ✅ `env.production.example` created with Railway backend URL
- ✅ Stripe public key configured
- ✅ API configuration centralized in `src/config/api.config.js`

### 2. Configuration Files
- ✅ `vercel.json` configured for Vite + Vue Router
- ✅ SPA routing configured
- ✅ Asset caching enabled

---

## 🎯 Deployment on Vercel (Recommended - أسهل طريقة!)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd frontend
vercel --prod
```

### Step 4: Set Environment Variables (في Vercel Dashboard)
1. Go to: `Project Settings → Environment Variables`
2. Add:
   - `VITE_API_BASE_URL` = `https://web-production-62770.up.railway.app/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_51S7EBnKDUj7pEum7RSuudwZIalWri0OrVjRbcMd57LvYH2uWFaTLvUojyC1FhYZYQSUjsIXIcxDR8Cuj4XymQT8R00TZU1Oia7`

---

## 🌐 Alternative: Deploy on Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```

### Step 3: Deploy
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Step 4: Set Environment Variables (في Netlify Dashboard)
1. Go to: `Site Settings → Build & deploy → Environment`
2. Add the same variables as Vercel

---

## ⚙️ Build Settings

### Vite Build Configuration
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** `>=16.0.0`

### Environment Variables Required
```bash
VITE_API_BASE_URL=https://web-production-62770.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S7EBnKDUj7pEum7RSuudwZIalWri0OrVjRbcMd57LvYH2uWFaTLvUojyC1FhYZYQSUjsIXIcxDR8Cuj4XymQT8R00TZU1Oia7
```

---

## 🔧 Backend CORS Configuration

### تحديث Laravel Backend (Railway):

1. **Go to Railway Dashboard**
2. **Backend Service → Variables**
3. **Add/Update:**
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

4. **Or edit `config/cors.php` if needed**

---

## ✅ Post-Deployment Verification

### 1. Test API Connection
```bash
# Open browser console on your deployed frontend
fetch('https://web-production-62770.up.railway.app/api/products')
  .then(r => r.json())
  .then(console.log)
```

### 2. Test Authentication
- Try login/register
- Check localStorage for tokens
- Verify API requests in Network tab

### 3. Test Stripe Integration
- Add item to cart
- Go to checkout
- Verify Stripe payment form loads

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error
**Solution:** Add your frontend URL to Railway backend CORS settings

### Issue 2: API 404 Errors
**Solution:** Verify `VITE_API_BASE_URL` ends with `/api`

### Issue 3: Stripe Not Loading
**Solution:** Check `VITE_STRIPE_PUBLISHABLE_KEY` in environment variables

### Issue 4: Routing 404
**Solution:** Verify `vercel.json` has correct rewrites for SPA

---

## 📊 Deployment Platforms Comparison

| Platform | Ease | Speed | Free Tier | Best For |
|----------|------|-------|-----------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | Fast | Yes | Vue/React |
| **Netlify** | ⭐⭐⭐⭐ | Fast | Yes | Static Sites |
| **Railway** | ⭐⭐⭐ | Medium | Limited | Full-Stack |

---

## 🎯 Recommended: Use Vercel!

**Why Vercel?**
- ✅ أسهل طريقة
- ✅ تلقائي Integration مع Git
- ✅ سريع جداً
- ✅ Free tier كويس
- ✅ مصمم لـ Vite/Vue

---

## 📝 Quick Deploy Commands

```bash
# Vercel
cd frontend
vercel --prod

# Netlify
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## ✅ Done!

Your frontend should now be live! 🎉
