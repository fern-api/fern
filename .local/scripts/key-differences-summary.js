#!/usr/bin/env node

const fs = require('fs');

/**
 * Script to show a clean summary of the key differences between local and remote IR files
 */

function showKeyDifferences() {
    const localFile = '../local-ir.json';
    const remoteFile = '../remote-ir.json';
    
    console.log('Loading JSON files...');
    const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    const remoteData = JSON.parse(fs.readFileSync(remoteFile, 'utf8'));
    
    console.log('\n=== KEY DIFFERENCES SUMMARY ===\n');
    
    // 1. Self-hosted vs Remote
    console.log('1. HOSTING CONFIGURATION:');
    console.log(`   Local:  selfHosted = ${localData.selfHosted}`);
    console.log(`   Remote: selfHosted = ${remoteData.selfHosted}`);
    console.log(`   Local:  fdrApiDefinitionId = ${localData.fdrApiDefinitionId}`);
    console.log(`   Remote: fdrApiDefinitionId = ${remoteData.fdrApiDefinitionId}`);
    
    // 2. Publish Config
    console.log('\n2. PUBLISH CONFIGURATION:');
    console.log('   Local publishConfig:');
    if (localData.publishConfig) {
        console.log(`     type: ${localData.publishConfig.type}`);
        console.log(`     owner: ${localData.publishConfig.owner}`);
        console.log(`     repo: ${localData.publishConfig.repo}`);
        console.log(`     uri: ${localData.publishConfig.uri}`);
        console.log(`     mode: ${localData.publishConfig.mode}`);
        console.log(`     target.packageName: ${localData.publishConfig.target?.packageName}`);
        console.log(`     target.version: ${localData.publishConfig.target?.version}`);
    } else {
        console.log('     null');
    }
    
    console.log('   Remote publishConfig:');
    if (remoteData.publishConfig) {
        console.log(`     type: ${remoteData.publishConfig.type}`);
        console.log(`     owner: ${remoteData.publishConfig.owner}`);
        console.log(`     repo: ${remoteData.publishConfig.repo}`);
        console.log(`     uri: ${remoteData.publishConfig.uri}`);
        console.log(`     mode: ${remoteData.publishConfig.mode}`);
        console.log(`     target.packageName: ${remoteData.publishConfig.target?.packageName}`);
        console.log(`     target.version: ${remoteData.publishConfig.target?.version}`);
    } else {
        console.log('     null');
    }
    
    // 3. Dynamic Config
    console.log('\n3. DYNAMIC CONFIGURATION:');
    console.log('   Local dynamic.generatorConfig:');
    if (localData.dynamic?.generatorConfig) {
        console.log(`     apiName: ${localData.dynamic.generatorConfig.apiName}`);
        console.log(`     organization: ${localData.dynamic.generatorConfig.organization}`);
        console.log(`     customConfig.namespaceExport: ${localData.dynamic.generatorConfig.customConfig?.namespaceExport}`);
        console.log(`     outputConfig.type: ${localData.dynamic.generatorConfig.outputConfig?.type}`);
        console.log(`     outputConfig.value.packageName: ${localData.dynamic.generatorConfig.outputConfig?.value?.packageName}`);
        console.log(`     outputConfig.value.version: ${localData.dynamic.generatorConfig.outputConfig?.value?.version}`);
    } else {
        console.log('     null');
    }
    
    console.log('   Remote dynamic.generatorConfig:');
    if (remoteData.dynamic?.generatorConfig) {
        console.log(`     apiName: ${remoteData.dynamic.generatorConfig.apiName}`);
        console.log(`     organization: ${remoteData.dynamic.generatorConfig.organization}`);
        console.log(`     customConfig.namespaceExport: ${remoteData.dynamic.generatorConfig.customConfig?.namespaceExport}`);
        console.log(`     outputConfig.type: ${remoteData.dynamic.generatorConfig.outputConfig?.type}`);
        console.log(`     outputConfig.value.packageName: ${remoteData.dynamic.generatorConfig.outputConfig?.value?.packageName}`);
        console.log(`     outputConfig.value.version: ${remoteData.dynamic.generatorConfig.outputConfig?.value?.version}`);
    } else {
        console.log('     null');
    }
    
    // 4. SDK Config
    console.log('\n4. SDK CONFIGURATION:');
    console.log('   Local sdkConfig.platformHeaders.userAgent:');
    console.log(`     ${JSON.stringify(localData.sdkConfig?.platformHeaders?.userAgent)}`);
    
    console.log('   Remote sdkConfig.platformHeaders.userAgent:');
    console.log(`     ${JSON.stringify(remoteData.sdkConfig?.platformHeaders?.userAgent)}`);
    
    // 5. File sizes
    console.log('\n5. FILE SIZES:');
    const localSize = fs.statSync('../local-ir.json').size;
    const remoteSize = fs.statSync('../remote-ir.json').size;
    console.log(`   Local file:  ${(localSize / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Remote file: ${(remoteSize / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Difference:  ${((localSize - remoteSize) / 1024 / 1024).toFixed(1)} MB`);
    
    console.log('\n=== SUMMARY ===');
    console.log('The main differences are:');
    console.log('• Local is self-hosted, remote is cloud-hosted');
    console.log('• Local has detailed publish config, remote has null');
    console.log('• Local has null generator config, remote has full config');
    console.log('• Local has null user agent, remote has specific user agent');
    console.log('• Local file is much larger due to more verbose object definitions');
}

if (require.main === module) {
    showKeyDifferences();
}
