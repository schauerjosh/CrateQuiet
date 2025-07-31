# CrateQuiet

CrateQuiet is a modern, privacy-first dog bark monitoring and training app built with Expo and React Native. It helps dog owners monitor, track, and respond to barking events in real time, with a beautiful dark-themed UI and robust detection logic. Designed for reliability and ease of use, CrateQuiet is ready for deployment to the App Store.

## Features

- **Onboarding Flow:** Friendly, image-rich onboarding for new users.
- **Dog Profile:** Store your dog's name, breed, age, and photo.
- **Bark Detection:**
  - Advanced microphone monitoring with false positive reduction.
  - Customizable sensitivity.
  - Immediate vibration and delayed custom sound response.
  - Cooldown logic to prevent repeated triggers.
- **Session Tracking:**
  - Tracks barking events and session durations.
  - Progress dashboard with stats and charts.
- **Custom Sound:** Record and use your own sound for bark response.
- **Dark Theme:** Consistent, beautiful dark UI and status bar.
- **Asset Management:** All icons and images are local for fast, reliable loading.
- **Expo Router:** Modern navigation with onboarding-first logic.
- **App Store Ready:** All assets, configs, and code are production-ready.

## Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/schauerjosh/CrateQuiet.git
   cd CrateQuiet
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the app:**
   ```bash
   npx expo start
   ```
   Scan the QR code with your iOS or Android device (Expo Go or dev build).

## Folder Structure

```
CrateQuiet/
├── app/                # App screens and navigation (Expo Router)
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   ├── dog-profile.tsx
│   ├── ...
│   └── (tabs)/         # Tabbed navigation screens
├── assets/             # Images, icons, and other static assets
├── components/         # Reusable UI components
├── constants/          # Color palette and other constants
├── context/            # App-wide context (state, bark detection, etc.)
├── types/              # TypeScript types
├── docs/               # Documentation and marketing site (optional)
├── app.json            # Expo app configuration
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Configuration

- **App Icon, Splash, and Assets:**
  - All referenced in `app.json` and stored in `assets/`.
- **Status Bar:**
  - Consistently dark across all screens.
- **Custom Sound:**
  - Record in-app and stored locally (permissions required).
- **Onboarding:**
  - Shown on first launch, then skipped for returning users.

## App Store Submission Notes

- All assets are local and copyright-cleared.
- No third-party tracking or analytics by default.
- Permissions: Microphone (for bark detection and custom sound), Notifications (optional).
- Fully tested on iOS and Android devices.
- Remove any test/demo data before submission.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

**CrateQuiet** — Modern, privacy-first bark monitoring for your best friend.
