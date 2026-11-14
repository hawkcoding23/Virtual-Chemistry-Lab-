# Google accounts and synced chemistry notebooks

The lab uses Firebase Authentication for Google sign-in and Cloud Firestore for each account's private profile and learning progress. Firebase keeps the browser signed in between visits; the Chemistry World welcome screen still appears, and the learner clicks **Enter the lab** to continue.

## One-time Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/.
2. In **Authentication → Sign-in method**, enable **Google**.
3. In **Authentication → Settings → Authorized domains**, add `virtual-chemistry-lab.hawkcoding23.workers.dev` (and any custom domain later).
4. Create a **Cloud Firestore** database.
5. In **Firestore → Rules**, publish the contents of `firestore.rules`. These rules only let a signed-in user read or change documents under their own UID.
6. In **Project settings → General → Your apps**, register a Web app and copy its Firebase config values.
7. Create `.env.local` in the project root using `.env.example` as a template. Fill `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` from the Firebase web config. Do not commit `.env.local`.
8. Build and deploy again. For Git-based Cloudflare deployment, add those four `VITE_FIREBASE_*` values under the project's build environment variables before redeploying.

The Firebase web API key is a client identifier, not a server secret. Keep Firestore protected with the rules above and never put service-account credentials in this frontend project.
