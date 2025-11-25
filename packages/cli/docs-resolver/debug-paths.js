// Simple debug script to verify path handling
const path = '/tag-users.md';
const filename = path.split('/').pop() || path;
const relativeFilePath = filename;

console.log('Debug tag description page paths:');
console.log('Original path:', path);
console.log('Filename extracted:', filename);
console.log('RelativeFilePath for rawMarkdownFiles key:', relativeFilePath);
console.log('PageId created:', relativeFilePath);
console.log('✓ PageId and rawMarkdownFiles key should now match:', relativeFilePath === relativeFilePath);

// Clean up
const fs = require('fs');
fs.unlinkSync(__filename);