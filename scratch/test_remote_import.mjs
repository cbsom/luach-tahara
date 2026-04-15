import fs from 'fs';

const username = 'rxi7tw2m';
const password = 'rh411e3z';

async function testFetch() {
  const token = Buffer.from(`${username}:~~~~~~~~~~~~~:${password}`).toString('base64');
  const url = 'https://www.compute.co.il/api/luach/restore';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.Succeeded && data.FileData) {
        const buffer = Buffer.from(data.FileData, 'base64');
        const dbPath = 'scratch/test_backup.sqlite';
        if (!fs.existsSync('scratch')) {
            fs.mkdirSync('scratch');
        }
        fs.writeFileSync(dbPath, buffer);
        console.log(`Database saved to ${dbPath}`);
    } else {
        console.error('Failed to fetch backup:', data.ErrorMessage);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testFetch();
