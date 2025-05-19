import axios from 'axios';

export function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(\/|$)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2] };
}

export async function listRepoContents(owner, repo, path = '') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await axios.get(url);
  return res.data; // includes both files and folders
}

export async function fetchFileContent(owner, repo, filePath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await axios.get(url);
  const content = atob(res.data.content); // decode base64
  return content;
}

// export async function listRepoFiles(owner, repo, path = '') {
//   const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//   const res = await axios.get(url);
//   return res.data.filter((file) => file.type === 'file');
// }

// export async function listRepoContents(owner, repo, path = '') {
//   const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//   const res = await axios.get(url);
//   // returns array of { name, path, type: 'file' | 'dir', ... }
//   return res.data;
// }


// export async function fetchFileContent(owner, repo, path) {
//   const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//   const res = await axios.get(url);
//   const content = Buffer.from(res.data.content, 'base64').toString();
//   return content;
// }
