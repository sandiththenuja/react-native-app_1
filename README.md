# Subscription tracker

An Expo and React Native application for keeping recurring subscriptions organized.

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Clerk application with username and email sign-up and email/password sign-in enabled. Require email verification at sign-up using a verification code.
3. Copy `.env.example` to `.env` and add the Clerk **publishable key**:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

   The publishable key is safe to include in the client app. Never put a Clerk secret key in an `EXPO_PUBLIC_` variable or commit it.
4. Start the app:

   ```bash
   npx expo start
   ```

The app uses custom NativeWind screens for email/password sign-up and sign-in, email verification, and password recovery. Clerk sessions are persisted with Expo SecureStore. Signed-out visitors are sent to sign-in; authenticated visitors are sent to the app.

For a production build, configure the app's bundle identifiers and allowed native application settings in the Clerk Dashboard, then build with EAS. The existing app URL scheme is `app1`.

## Project structure

- `app/` contains Expo Router screens and layouts.
- `components/` contains reusable interface components.
- `constants/` contains app data and design tokens.
- `global.css` defines the NativeWind theme and shared component utilities.
