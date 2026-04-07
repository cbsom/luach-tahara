import fs from 'fs';

async function fetchRemoteBackup(username, password) {
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
    if (!data.Succeeded || !data.FileData) {
      throw new Error(data.ErrorMessage || 'Failed to fetch backup');
    }

    const binaryString = atob(data.FileData);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (err) {
    console.error('Error fetching remote backup', err);
    throw err;
  }
}

async function run() {
  const bytes = await fetchRemoteBackup('Cbsomme', 'Cgsomme');
  fs.writeFileSync('test.sqlite', bytes);
  console.log('Saved to test.sqlite');
}
run();
