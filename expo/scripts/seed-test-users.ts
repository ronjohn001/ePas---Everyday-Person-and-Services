/**
 * One-off seed script for ePaS test accounts.
 * Usage (from expo/):
 *   bun scripts/seed-test-users.ts          -> create the 3 accounts
 *   bun scripts/seed-test-users.ts verify   -> sign in each and print role/status
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envRaw = readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    }),
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const PASSWORD = 'ePaSTest2026!';
const USERS = [
  { email: 'customer@epas.sl', name: 'Aminata Kamara', role: 'CUSTOMER', phone: '+23276111001' },
  { email: 'trader@epas.sl', name: 'Mohamed Bangura', role: 'PROVIDER', phone: '+23277222002' },
  { email: 'admin@epas.sl', name: 'ePaS Admin', role: 'ADMIN', phone: '+23278333003' },
] as const;

const mode = process.argv[2] === 'verify' ? 'verify' : 'seed';

for (const u of USERS) {
  const supabase = createClient(url, key);
  if (mode === 'seed') {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: PASSWORD,
      options: { data: { name: u.name, role: u.role, phone: u.phone, account_type: 'PRIVATE' } },
    });
    if (error) {
      console.log(`${u.email}: signUp -> ${error.message.includes('already') ? 'already exists' : `ERROR ${error.message}`}`);
    } else {
      const uid = data.user?.id;
      console.log(`${u.email}: created (id=${uid}, session=${data.session ? 'yes' : 'no — email confirmation required'})`);
      if (uid && data.session) {
        const { error: phoneErr } = await supabase.from('user_phones').insert({
          user_id: uid,
          phone: u.phone,
          label: 'Main',
          is_primary: true,
        });
        if (phoneErr) console.log(`  phone insert: ${phoneErr.message}`);
      }
    }
    await supabase.auth.signOut();
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({ email: u.email, password: PASSWORD });
    if (error) {
      console.log(`${u.email}: signIn FAILED -> ${error.message}`);
      continue;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role, approval_status')
      .eq('id', data.user.id)
      .maybeSingle();
    console.log(`${u.email}: signIn OK -> role=${profile?.role ?? '?'} status=${profile?.approval_status ?? '?'}`);
    await supabase.auth.signOut();
  }
}
