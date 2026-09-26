# LazySiren

The OS that works while you watch.

LazySiren is an AI-native operating system. The model is not a chatbot on the side — it lives in the kernel. It can write files, open apps, browse, post, forge new OS commands, and generate apps it then uses.

Nexus is the app drawer. Everything else is LazySiren.

## Run it

```bash
git clone https://github.com/AFKmoney/nexusOS-dev-.git
cd nexusOS-dev-
npm install
npm run dev
```

Open the local URL. Settings → AI Providers → paste a key (Z.ai, OpenAI, or whatever you use). Talk to DAEMON.

## What it actually does

- **DAEMON** calls real tools: files, windows, NetRunner, X, GBA, skills.
- **build_app** writes a full app into `/system/apps`, registers it, opens it.
- **use_app** drives that app (click / set / eval).
- **forge_skill** + `exposeAs` mints a new `OS::COMMAND`.
- Lock and boot carry the LazySiren mark — sine wave, glass, particles.

## Stack

React 19, Vite, Zustand, IndexedDB VFS. Optional Electron.

## Android APK

This is a web OS. The APK is a Capacitor shell around `vite build`.

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android --save
npx cap add android
npm run apk:sync
npm run apk:open
```

In Android Studio: Build → Build APK. First install needs a keystore you create once.

Until that machine exists, install as PWA from Chrome (Add to Home screen). Same OS, no Play Store.

