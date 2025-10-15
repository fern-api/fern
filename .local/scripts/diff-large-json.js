#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to create a readable diff between two large JSON files
 * Handles large files by comparing structure and key differences
 */

function loadJsonFile(filePath) {
    try {
        console.log(`Loading ${filePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        process.exit(1);
    }
}

function getObjectKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys.push(...getObjectKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function compareObjects(obj1, obj2, path = '') {
    const differences = [];
    const keys1 = new Set(getObjectKeys(obj1, path));
    const keys2 = new Set(getObjectKeys(obj2, path));
    
    // Find keys only in obj1
    for (const key of keys1) {
        if (!keys2.has(key)) {
            differences.push({
                type: 'only_in_local',
                path: key,
                value: getValueByPath(obj1, key)
            });
        }
    }
    
    // Find keys only in obj2
    for (const key of keys2) {
        if (!keys1.has(key)) {
            differences.push({
                type: 'only_in_remote',
                path: key,
                value: getValueByPath(obj2, key)
            });
        }
    }
    
    // Find different values
    for (const key of keys1) {
        if (keys2.has(key)) {
            const val1 = getValueByPath(obj1, key);
            const val2 = getValueByPath(obj2, key);
            
            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                differences.push({
                    type: 'different_value',
                    path: key,
                    localValue: val1,
                    remoteValue: val2
                });
            }
        }
    }
    
    return differences;
}

function formatValue(value, maxLength = 100) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') {
        return value.length > maxLength ? `"${value.substring(0, maxLength)}..."` : `"${value}"`;
    }
    if (typeof value === 'object') {
        const str = JSON.stringify(value);
        return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
    }
    return String(value);
}

function generateDiffReport(localData, remoteData, outputFile) {
    console.log('Analyzing differences...');
    
    const differences = compareObjects(localData, remoteData);
    
    // Group differences by type
    const onlyInLocal = differences.filter(d => d.type === 'only_in_local');
    const onlyInRemote = differences.filter(d => d.type === 'only_in_remote');
    const differentValues = differences.filter(d => d.type === 'different_value');
    
    let report = `# JSON Diff Report
Generated: ${new Date().toISOString()}

## Summary
- Total differences: ${differences.length}
- Keys only in local: ${onlyInLocal.length}
- Keys only in remote: ${onlyInRemote.length}
- Different values: ${differentValues.length}

## Top-Level Differences
`;

    // Check top-level keys
    const topLevelKeys1 = Object.keys(localData);
    const topLevelKeys2 = Object.keys(remoteData);
    
    report += `\n### Top-level keys comparison:
Local keys: ${topLevelKeys1.join(', ')}
Remote keys: ${topLevelKeys2.join(', ')}

Top-level differences:
`;
    
    for (const key of topLevelKeys1) {
        if (!topLevelKeys2.includes(key)) {
            report += `- "${key}" only exists in local file\n`;
        } else if (JSON.stringify(localData[key]) !== JSON.stringify(remoteData[key])) {
            report += `- "${key}" has different values\n`;
        }
    }
    
    for (const key of topLevelKeys2) {
        if (!topLevelKeys1.includes(key)) {
            report += `- "${key}" only exists in remote file\n`;
        }
    }

    // Add detailed differences (limit to first 100 of each type for readability)
    if (onlyInLocal.length > 0) {
        report += `\n## Keys Only in Local File (showing first 100)\n`;
        onlyInLocal.slice(0, 100).forEach(diff => {
            report += `- ${diff.path}: ${formatValue(diff.value)}\n`;
        });
        if (onlyInLocal.length > 100) {
            report += `... and ${onlyInLocal.length - 100} more\n`;
        }
    }

    if (onlyInRemote.length > 0) {
        report += `\n## Keys Only in Remote File (showing first 100)\n`;
        onlyInRemote.slice(0, 100).forEach(diff => {
            report += `- ${diff.path}: ${formatValue(diff.value)}\n`;
        });
        if (onlyInRemote.length > 100) {
            report += `... and ${onlyInRemote.length - 100} more\n`;
        }
    }

    if (differentValues.length > 0) {
        report += `\n## Different Values (showing first 100)\n`;
        differentValues.slice(0, 100).forEach(diff => {
            report += `- ${diff.path}:\n`;
            report += `  Local:  ${formatValue(diff.localValue)}\n`;
            report += `  Remote: ${formatValue(diff.remoteValue)}\n\n`;
        });
        if (differentValues.length > 100) {
            report += `... and ${differentValues.length - 100} more\n`;
        }
    }

    // Add file size comparison
    report += `\n## File Size Comparison
- Local file: ${fs.statSync('../local-ir.json').size} bytes
- Remote file: ${fs.statSync('../remote-ir.json').size} bytes
- Size difference: ${fs.statSync('../local-ir.json').size - fs.statSync('../remote-ir.json').size} bytes
`;

    fs.writeFileSync(outputFile, report);
    console.log(`Diff report written to: ${outputFile}`);
}

function main() {
    const localFile = '../local-ir.json';
    const remoteFile = '../remote-ir.json';
    const outputFile = './json-diff-report.md';
    
    console.log('Starting JSON diff analysis...');
    console.log(`Local file: ${localFile}`);
    console.log(`Remote file: ${remoteFile}`);
    
    const localData = loadJsonFile(localFile);
    const remoteData = loadJsonFile(remoteFile);
    
    generateDiffReport(localData, remoteData, outputFile);
    
    console.log('\nAnalysis complete!');
    console.log(`View the report: ${outputFile}`);
}

if (require.main === module) {
    main();
}

module.exports = { loadJsonFile, compareObjects, generateDiffReport };
