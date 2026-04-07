process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'fs';
import crypto from 'crypto';

async function fetchRemoteBackup(username, password) {
  const token = Buffer.from(`${username}:~~~~~~~~~~~~~:${password}`).toString('base64');
  const response = await fetch('https://localhost:86/api/luach/restore', {
    headers: { Authorization: `bearer ${token}` },
  });
  const data = await response.json();
  const b = Buffer.from(data.FileData, 'base64');
  return b;
}

async function run() {
  const remoteBuf = await fetchRemoteBackup('Cbsomme', 'Cgsomme');
  const remoteHash = crypto.createHash('sha256').update(remoteBuf).digest('hex');
  fs.writeFileSync('compare_debug2.txt', `Node Buffer.from remote hash: ${remoteHash}`);
}
run();
