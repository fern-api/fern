const fs = require('fs');
const path = require('path');

const parseChangelog = (changelogContent) => {
  const entries = [];
  let currentVersion = null;
  let currentDate = null;
  let currentChanges = [];
  let currentChange = null;
  let codeBlockDepth = 0;

  const lines = changelogContent.split('\n');
  for (const line of lines) {
    const versionMatch = line.match(/## \[(\d+\.\d+\.\d+(?:-\w+)?)\] - (\d{4}-\d{2}-\d{2})/);
    if (versionMatch) {
      if (currentVersion) {
        if (currentChange) {
          currentChanges.push(currentChange);
        }
        entries.push({
          version: currentVersion,
          date: currentDate,
          changes: currentChanges
        });
      }
      currentVersion = versionMatch[1];
      currentDate = versionMatch[2];
      currentChanges = [];
      currentChange = null;
      codeBlockDepth = 0;
    } else if (line.trim().startsWith('- ') && codeBlockDepth === 0) {
      if (currentChange) {
        currentChanges.push(currentChange);
      }
      currentChange = line;
    } else if (currentChange) {
      if (line.trim().startsWith('```')) {
        codeBlockDepth = codeBlockDepth === 0 ? 1 : codeBlockDepth - 1;
      }
      currentChange += '\n' + line;
    }
  }

  if (currentVersion) {
    if (currentChange) {
      currentChanges.push(currentChange);
    }
    entries.push({
      version: currentVersion,
      date: currentDate,
      changes: currentChanges
    });
  }

  return entries;
};

const convertToNewFormat = (entries) => {
  return entries.map(entry => {
    const changes = entry.changes.map(change => {
      let type = 'fix';  // default type
      let summary = change;

      const firstLine = summary.split('\n')[0].toLowerCase();
      if (firstLine.includes('feature:') || firstLine.includes('feat:')) {
        type = 'feat';
      } else if (firstLine.includes('chore:')) {
        type = 'chore';
      }

      // Remove the prefix (Feature:, Feat:, Fix:, Chore:) if present
      summary = summary.split('\n').map((line, index) => {
        if (index === 0) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            return line.slice(colonIndex + 1).trim();
          }
        }
        return line;
      }).join('\n');

      // Remove any lines that match the version header pattern
      summary = summary.split('\n').filter(line => !line.match(/^## \[\d+\.\d+\.\d+(?:-\w+)?\] - \d{4}-\d{2}-\d{2}$/)).join('\n');

      return { summary: summary.trim(), type };
    });

    return {
      changelogEntry: changes,
      irVersion: 53, // Using a constant value as per the example
      version: entry.version,
      createdAt: entry.date
    };
  });
};

const formatOutput = (newFormat) => {
  return newFormat.map(entry => {
    const formattedEntries = entry.changelogEntry.map(change => {
      const summaryLines = change.summary.split('\n');
      const formattedSummary = summaryLines.map((line, index) => {
        if (index === 0) {
          return line;
        } else {
          return ' '.repeat(8) + line;
        }
      }).join('\n');

      return `- changelogEntry:
    - summary: |
        ${formattedSummary}
      type: ${change.type}
  irVersion: ${entry.irVersion}
  version: "${entry.version}"
  createdAt: "${entry.createdAt}"`;
    }).join('\n\n');

    return formattedEntries;
  }).join('\n\n');
};

const convertChangelog = (inputContent) => {
  const entries = parseChangelog(inputContent);
  const newFormat = convertToNewFormat(entries);
  return formatOutput(newFormat);
};

// Get the input file path from command line arguments
const inputFilePath = process.argv[2];

if (!inputFilePath) {
  console.error('Please provide a path to the input changelog file.');
  process.exit(1);
}

// Resolve the absolute path
const absoluteInputPath = path.resolve(inputFilePath);

// Check if the file exists
if (!fs.existsSync(absoluteInputPath)) {
  console.error(`The file "${absoluteInputPath}" does not exist.`);
  process.exit(1);
}

// Read the input file
try {
  const inputContent = fs.readFileSync(absoluteInputPath, 'utf8');
  const output = convertChangelog(inputContent);
  console.log(output);
} catch (error) {
  console.error(`An error occurred while reading the file: ${error.message}`);
  process.exit(1);
}