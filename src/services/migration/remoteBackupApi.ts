export async function fetchRemoteBackup(username: string, password: string): Promise<Uint8Array | null> {
  const token = btoa(`${username}:~~~~~~~~~~~~~:${password}`);
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
      console.error('Remote backup response not ok', response.status);
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (!data.Succeeded || !data.FileData) {
      console.error('Remote backup failed', data.ErrorMessage || 'No FileData returned');
      throw new Error(data.ErrorMessage || 'Failed to fetch backup');
    }

    // Decode base64 to Uint8Array
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
