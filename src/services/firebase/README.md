# Firebase Integration

Complete Firebase integration for authentication and cloud sync.

## Features

- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Password reset
- ✅ Cloud data sync (Firestore)
- ✅ Automatic sync on login
- ✅ Periodic auto-sync
- ✅ Offline-first with sync queue
- ✅ React hooks for easy integration

## Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create a Firestore database

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Under "Your apps", add a Web app
3. Copy the configuration values

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Set up security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only accessible by the owner
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Usage

### Authentication

```typescript
import { useAuth } from '@/services/firebase';

function LoginPage() {
  const { signIn, signInGoogle, signUp, user, loading } = useAuth();

  const handleEmailLogin = async () => {
    await signIn('email@example.com', 'password');
  };

  const handleGoogleLogin = async () => {
    await signInGoogle();
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.displayName}!</div>;

  return (
    <div>
      <button onClick={handleEmailLogin}>Sign In with Email</button>
      <button onClick={handleGoogleLogin}>Sign In with Google</button>
    </div>
  );
}
```

### Data Sync

```typescript
import { useSync, useAutoSync } from '@/services/firebase';

function SyncButton() {
  const { sync, syncing, lastSyncTime, syncError } = useSync();

  // Auto-sync on mount
  useAutoSync(true);

  return (
    <div>
      <button onClick={sync} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
      {lastSyncTime && <p>Last sync: {lastSyncTime.toLocaleString()}</p>}
      {syncError && <p className="error">{syncError}</p>}
    </div>
  );
}
```

### Manual Sync Operations

```typescript
import {
  syncToFirebase,
  pullFromFirebase,
  fullSync,
  startAutoSync,
  stopAutoSync,
} from '@/services/firebase';

// Push local changes to Firebase
await syncToFirebase();

// Pull data from Firebase to local
await pullFromFirebase();

// Full sync (pull then push)
await fullSync();

// Start auto-sync every 5 minutes
startAutoSync(5 * 60 * 1000);

// Stop auto-sync
stopAutoSync();
```

## Data Structure

### Firestore Collections

```
users/
  {userId}/
    entries/
      {entryId}
        - jewishDate
        - onah
        - haflaga
        - ignoreForFlaggedDates
        - ignoreForKavuah
        - comments
        - createdAt
        - updatedAt
        - deleted

    kavuahs/
      {kavuahId}
        - kavuahType
        - settingEntryId
        - specialNumber
        - cancelsOnahBeinunis
        - active
        - ignore
        - createdAt
        - updatedAt
        - deleted

    settings/
      user-settings
        - location
        - showFlagsOnMainScreen
        - keepThirtyOne
        - onahBeinunis24Hours
        - ... (all settings)
```

## Sync Behavior

### Automatic Sync

- Syncs automatically on user login
- Periodic sync every 5 minutes (configurable)
- Syncs when app comes back online

### Conflict Resolution

- Last write wins (timestamp-based)
- Soft deletes preserved until synced
- Local changes always pushed to cloud

### Offline Support

- All operations work offline
- Changes queued in IndexedDB
- Automatically synced when online

## Security

- All data is user-scoped
- Firestore rules enforce user isolation
- Authentication required for all operations
- Passwords hashed by Firebase Auth

## Testing

```typescript
// Check if user is authenticated
import { isAuthenticated, getCurrentUser } from '@/services/firebase';

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('User:', user?.email);
}

// Get user token for API calls
import { getUserToken } from '@/services/firebase';

const token = await getUserToken();
```

## Troubleshooting

### "User not authenticated" error

- Make sure user is logged in before syncing
- Check Firebase Auth configuration

### Sync fails silently

- Check browser console for errors
- Verify Firestore security rules
- Ensure network connectivity

### Data not appearing after sync

- Check Firestore console for data
- Verify user ID matches
- Try full sync instead of partial

## Best Practices

1. **Always handle auth state** - Use `useAuth` hook
2. **Enable auto-sync** - Use `useAutoSync` in your app root
3. **Handle offline gracefully** - All operations work offline
4. **Monitor sync status** - Use `useSync` to show sync state
5. **Test with multiple devices** - Verify sync works across devices

## API Reference

### Authentication

- `signInWithEmail(email, password)` - Sign in with email/password
- `signUpWithEmail(email, password, displayName?)` - Create new account
- `signInWithGoogle()` - Sign in with Google
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get current user
- `isAuthenticated()` - Check if user is logged in

### Sync

- `syncToFirebase()` - Push local changes to cloud
- `pullFromFirebase()` - Pull cloud data to local
- `fullSync()` - Full bidirectional sync
- `startAutoSync(intervalMs?)` - Start periodic sync
- `stopAutoSync()` - Stop periodic sync

### Hooks

- `useAuth()` - Authentication state and methods
- `useSync()` - Sync state and methods
- `useAutoSync(enabled)` - Auto-sync on mount
