import { writeFile } from 'node:fs/promises';
import {
  MAJI_EPISODES,
  BEDTIME_TALES,
  CALM_TALES,
  EXISTING_STORIES,
} from '../src/data.js';

const groups = [
  ['maji', MAJI_EPISODES],
  ['classic', EXISTING_STORIES],
  ['bedtime', BEDTIME_TALES],
  ['calm', CALM_TALES],
];

const sqlString = (value) => {
  if (value === undefined || value === null) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
};

const bool = (value) => (value ? 'true' : 'false');

const rows = groups.flatMap(([collection, stories]) =>
  stories.map((story, index) => `(
    ${Number(story.id)},
    ${sqlString(collection)},
    ${index + 1},
    ${sqlString(story.title)},
    ${sqlString(story.cover)},
    ${sqlString(story.age)},
    ${sqlString(story.readTime)},
    ${sqlString(story.category)},
    ${sqlString(story.icon)},
    ${bool(story.featured)},
    ${bool(story.isPremium)},
    ${sqlString(story.body)},
    ${sqlString(story.moral)},
    ${sqlString(story.audio)}
  )`)
);

const sql = `insert into public.stories (
  story_id,
  collection,
  sort_order,
  title,
  cover,
  age,
  read_time,
  category,
  icon,
  featured,
  is_premium,
  body,
  moral,
  audio
) values
${rows.join(',\n')}
on conflict (story_id) do update set
  collection = excluded.collection,
  sort_order = excluded.sort_order,
  title = excluded.title,
  cover = excluded.cover,
  age = excluded.age,
  read_time = excluded.read_time,
  category = excluded.category,
  icon = excluded.icon,
  featured = excluded.featured,
  is_premium = excluded.is_premium,
  body = excluded.body,
  moral = excluded.moral,
  audio = excluded.audio,
  updated_at = now();
`;

await writeFile('supabase/seed.sql', sql);
console.log('Wrote supabase/seed.sql');

