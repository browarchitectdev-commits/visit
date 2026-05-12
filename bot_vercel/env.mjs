import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    if (value === '{') {
      const jsonLines = ['{'];

      while (index + 1 < lines.length) {
        index += 1;
        jsonLines.push(lines[index]);

        if (lines[index].trim() === '}') {
          break;
        }
      }

      value = jsonLines.join('\n');
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

export const loadLocalEnvFile = () => {
  // Astro/Vercel load root env automatically. This fallback keeps the existing bot/.env usable locally.
  parseEnvFile(resolve(process.cwd(), 'bot/.env'));
};
