#!/usr/bin/env node

const fs = require('fs');

/**
 * Script to find specific sections in the diff that might be getting skipped
 */

function findPublishConfigDiff() {
    const localFile = '../local-ir.json';
    const remoteFile = '../remote-ir.json';
    
    console.log('Loading JSON files...');
    const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    const remoteData = JSON.parse(fs.readFileSync(remoteFile, 'utf8'));
    
    console.log('\n=== PUBLISH CONFIG COMPARISON ===');
    
    console.log('\nLocal publishConfig:');
    console.log(JSON.stringify(localData.publishConfig, null, 2));
    
    console.log('\nRemote publishConfig:');
    console.log(JSON.stringify(remoteData.publishConfig, null, 2));
    
    console.log('\n=== DYNAMIC CONFIG COMPARISON ===');
    
    console.log('\nLocal dynamic:');
    console.log(JSON.stringify(localData.dynamic, null, 2));
    
    console.log('\nRemote dynamic:');
    console.log(JSON.stringify(remoteData.dynamic, null, 2));
    
    console.log('\n=== SDK CONFIG COMPARISON ===');
    
    console.log('\nLocal sdkConfig:');
    console.log(JSON.stringify(localData.sdkConfig, null, 2));
    
    console.log('\nRemote sdkConfig:');
    console.log(JSON.stringify(remoteData.sdkConfig, null, 2));
}

if (require.main === module) {
    findPublishConfigDiff();
}
