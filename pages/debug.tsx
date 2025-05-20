// pages/debug.tsx

import { contentfulClient } from '../lib/contentful';

export default function DebugPage({ entries }: { entries: any[] }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Contentful Debug Page</h1>

      {entries.length === 0 && (
        <p className="text-red-500">No entries found! Check your space or credentials.</p>
      )}

      <ul className="space-y-4">
        {entries.map((entry, index) => (
          <li key={index} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">
              {entry.fields?.name || 'Unnamed Entry'}
            </h2>
            <pre className="text-sm text-gray-600">{JSON.stringify(entry.fields, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
    try {
      const entriesResponse = await contentfulClient.getEntries();
      const entries = entriesResponse.items.map((entry: any) => ({
        id: entry.sys.id,
        name: entry.fields?.name || 'Unnamed',
        slug: entry.fields?.slug || '',
        description: entry.fields?.description || '',
      }));
  
      return {
        props: {
          entries,
        },
        revalidate: 60,
      };
    } catch (error) {
      console.error('Error fetching Contentful entries:', error);
      return {
        props: {
          entries: [],
        },
      };
    }
  }
  