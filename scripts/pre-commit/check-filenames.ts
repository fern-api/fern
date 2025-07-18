import { execSync } from 'child_process';

const invalidChars = /[<>:"|?*\x00-\x1F]/;
const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;

function checkFilenames(): void {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const files = output.split('\n').filter(Boolean);

    const invalidFiles = files.filter((file: string) => {
      const filename = file.split('/').pop();
      return invalidChars.test(file) || (filename && reservedNames.test(filename));
    });

    if (invalidFiles.length > 0) {
      console.error('❌ Invalid filenames found:');
      invalidFiles.forEach((file: string) => {
        console.error(`  - ${file}`);
      });
      console.error('\nFilenames cannot contain: < > : " | ? * or control characters');
      console.error('Reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9');
      process.exit(1);
    }

    console.log('✅ All filenames are valid for cross-platform compatibility');
  } catch (error) {
    console.error('Error checking filenames:', (error as Error).message);
    process.exit(1);
  }
}

checkFilenames();