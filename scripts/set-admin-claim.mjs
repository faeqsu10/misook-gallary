#!/usr/bin/env node
/**
 * One-time script to set admin custom claim on a Firebase user.
 * Usage: node scripts/set-admin-claim.mjs <user-email>
 *
 * Requires FIREBASE_SERVICE_ACCOUNT env var to be set.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!serviceAccount.project_id) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable not set');
  process.exit(1);
}

const app = initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <user-email>');
  process.exit(1);
}

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`Successfully set admin claim for ${email} (UID: ${user.uid})`);
  console.log('The user must sign out and back in for the claim to take effect.');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

process.exit(0);
