import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function getSpec() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const defs = json.definitions || json.components?.schemas;
  console.log(JSON.stringify(defs, null, 2));
}

getSpec();
