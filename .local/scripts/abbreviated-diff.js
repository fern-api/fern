#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Script to show an abbreviated line-by-line diff between two large JSON files
 * Skips identical sections and shows only the differences with context
 */

function formatJsonForDiff(jsonData) {
    // Pretty print JSON with consistent formatting
    return JSON.stringify(jsonData, null, 2);
}

function writeTempFile(content, filename) {
    const tempPath = `/tmp/${filename}`;
    fs.writeFileSync(tempPath, content);
    return tempPath;
}

function runDiff(localFile, remoteFile) {
    try {
        // Use git diff for better formatting and context
        // Reverse order: remote as base, local as changes
        const diffOutput = execSync(`git diff --no-index --unified=3 "${remoteFile}" "${localFile}"`, {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 100 // 100MB buffer
        });
        return diffOutput;
    } catch (error) {
        // git diff exits with code 1 when files differ, which is expected
        if (error.status === 1) {
            return error.stdout || '';
        }
        throw error;
    }
}

function abbreviateDiff(diffOutput, maxLines = Infinity) {
    const lines = diffOutput.split('\n');
    const abbreviated = [];
    let inHunk = false;
    let hunkLines = [];
    let hunkStart = 0;
    let identicalLines = 0;
    let totalLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
            // File header lines - always include
            abbreviated.push(line);
            continue;
        }
        
        if (line.startsWith('@@')) {
            // Start of a new hunk
            if (inHunk && hunkLines.length > 0) {
                // Process the previous hunk
                processHunk(hunkLines, hunkStart, abbreviated);
            }
            
            inHunk = true;
            hunkLines = [line];
            hunkStart = i;
            identicalLines = 0;
            continue;
        }
        
        if (inHunk) {
            hunkLines.push(line);
            
            // Count identical lines (lines that don't start with + or -)
            if (!line.startsWith('+') && !line.startsWith('-')) {
                identicalLines++;
            }
            
            // If we have too many identical lines, skip this hunk
            if (identicalLines > 20) {
                abbreviated.push(`... (skipping ${hunkLines.length} lines with ${identicalLines} identical context lines) ...`);
                inHunk = false;
                hunkLines = [];
                identicalLines = 0;
            }
        } else {
            abbreviated.push(line);
        }
        
        totalLines++;
        
        // Limit total output
        if (totalLines > maxLines) {
            abbreviated.push(`... (truncated after ${maxLines} lines) ...`);
            break;
        }
    }
    
    // Process the last hunk if we're still in one
    if (inHunk && hunkLines.length > 0) {
        processHunk(hunkLines, hunkStart, abbreviated);
    }
    
    return abbreviated.join('\n');
}

function processHunk(hunkLines, hunkStart, abbreviated) {
    const hasChanges = hunkLines.some(line => line.startsWith('+') || line.startsWith('-'));
    
    if (hasChanges) {
        // Show the hunk with limited context
        const contextLines = 5; // Show 5 lines of context before and after changes
        let contextBefore = [];
        let changes = [];
        let contextAfter = [];
        let inChanges = false;
        
        for (let i = 1; i < hunkLines.length; i++) { // Skip the @@ line
            const line = hunkLines[i];
            const isChange = line.startsWith('+') || line.startsWith('-');
            
            if (isChange) {
                inChanges = true;
                changes.push(line);
            } else if (inChanges) {
                contextAfter.push(line);
                if (contextAfter.length >= contextLines) break;
            } else {
                contextBefore.push(line);
                if (contextBefore.length > contextLines) {
                    contextBefore = contextBefore.slice(-contextLines);
                }
            }
        }
        
        // Add abbreviated hunk
        if (contextBefore.length > 0) {
            abbreviated.push(`... (${contextBefore.length} lines of context) ...`);
        }
        changes.forEach(line => abbreviated.push(line));
        if (contextAfter.length > 0) {
            abbreviated.push(`... (${contextAfter.length} lines of context) ...`);
        }
    }
}

function main() {
    const localFile = '../local-ir.json';
    const remoteFile = '../remote-ir.json';
    const outputFile = '../abbreviated-diff.txt';
    
    console.log('Loading JSON files...');
    
    // Load and format JSON files
    const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    const remoteData = JSON.parse(fs.readFileSync(remoteFile, 'utf8'));
    
    console.log('Formatting JSON for diff...');
    const localFormatted = formatJsonForDiff(localData);
    const remoteFormatted = formatJsonForDiff(remoteData);
    
    console.log('Writing temporary files...');
    const tempLocal = writeTempFile(localFormatted, 'local-ir-formatted.json');
    const tempRemote = writeTempFile(remoteFormatted, 'remote-ir-formatted.json');
    
    try {
        console.log('Running diff (remote -> local)...');
        const diffOutput = runDiff(tempLocal, tempRemote);
        
        console.log('Abbreviating diff...');
        const abbreviatedDiff = abbreviateDiff(diffOutput); // No line limit
        
        // Write the abbreviated diff
        fs.writeFileSync(outputFile, abbreviatedDiff);
        
        console.log(`\nAbbreviated diff written to: ${outputFile}`);
        console.log(`\nTo view the diff:`);
        console.log(`  cat ${outputFile}`);
        console.log(`  less ${outputFile}`);
        console.log(`  code ${outputFile}`);
        
        // Show a preview
        const lines = abbreviatedDiff.split('\n');
        console.log(`\nPreview (first 20 lines):`);
        console.log('='.repeat(50));
        lines.slice(0, 20).forEach((line, i) => {
            console.log(`${(i + 1).toString().padStart(3)}: ${line}`);
        });
        if (lines.length > 20) {
            console.log(`... and ${lines.length - 20} more lines`);
        }
        
    } finally {
        // Clean up temp files
        try {
            fs.unlinkSync(tempLocal);
            fs.unlinkSync(tempRemote);
        } catch (error) {
            console.warn('Warning: Could not clean up temp files:', error.message);
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = { abbreviateDiff, formatJsonForDiff };
