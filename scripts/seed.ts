import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("Seeding database...");

  // 0. Clean existing data (optional but recommended for repeatable seed)
  await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 1. Insert Categories
  const categoriesData = [
    { name: 'Water Leakage', department: 'Water Supply' },
    { name: 'Power Outage', department: 'Electricity' },
    { name: 'Pothole', department: 'Roads' },
    { name: 'Garbage Collection', department: 'Sanitation' },
    { name: 'Broken Traffic Light', department: 'Traffic' },
  ];

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert(categoriesData)
    .select();

  if (catError) {
    console.error("Error inserting categories:", catError);
    return;
  }
  console.log(`Inserted ${categories.length} categories.`);

  // 2. Insert Profiles (Officers)
  const profilesData = [
    { id: crypto.randomUUID(), email: 'rajesh.kumar@delhi.gov.in', full_name: 'Rajesh Kumar', role: 'officer' },
    { id: crypto.randomUUID(), email: 'meera.singh@delhi.gov.in', full_name: 'Meera Singh', role: 'officer' },
    { id: crypto.randomUUID(), email: 'amit.kumar@delhi.gov.in', full_name: 'Amit Kumar', role: 'officer' },
  ];

  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .insert(profilesData)
    .select();

  if (profError) {
    console.error("Error inserting profiles:", profError);
    return;
  }
  console.log(`Inserted ${profiles.length} profiles.`);

  // 3. Insert Complaints
  const cities = ['South West Delhi', 'East Delhi', 'North Delhi', 'Central Delhi', 'South East Delhi'];
  const statuses = ['submitted', 'in_progress', 'resolved'];
  const severities = ['L1', 'L2', 'L3', 'L4'];

  const complaintsData = [];
  for (let i = 1; i <= 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const officer = profiles[Math.floor(Math.random() * profiles.length)];
    
    complaintsData.push({
      ticket_id: `DEL-${1000 + i}`,
      title: `${category.name} reported in ${cities[i % cities.length]}`,
      description: `Detailed description for ${category.name} in ${cities[i % cities.length]}. This issue has been affecting the local residents for several days.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      effective_severity: severities[Math.floor(Math.random() * severities.length)], // just a fallback
      city: cities[i % cities.length],
      category_id: category.id,
      assigned_officer_id: officer.id,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
    });
  }

  const { data: complaints, error: compError } = await supabase
    .from('complaints')
    .insert(complaintsData)
    .select();

  if (compError) {
    console.error("Error inserting complaints:", compError);
    return;
  }
  console.log(`Inserted ${complaints.length} complaints.`);
  console.log("Seeding complete!");
}

seed();
