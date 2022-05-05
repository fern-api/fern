#!/usr/bin/env node

import { exec } from "child_process";
import { mkdir, readdir, readFile, rename } from "fs/promises";
import path from "path";
import { promisify } from "util";

const promisifiedExec = promisify(exec);

const MONOREPO_DIRECTORY = "/fern";
const ARTIFACTS_DIRECTORY = path.join(MONOREPO_DIRECTORY, "artifacts");

const PACKAGES_DIRECTORY = path.join(MONOREPO_DIRECTORY, "packages");
await mkdir(PACKAGES_DIRECTORY);

const artifacts = await readdir(ARTIFACTS_DIRECTORY);
for (const artifact of artifacts) {
    // unzip
    await promisifiedExec(`tar -xvf ${path.join(ARTIFACTS_DIRECTORY, artifact)} -C ${PACKAGES_DIRECTORY}`);

    // location of unzipped package
    const tempPackagePath = path.join(PACKAGES_DIRECTORY, "package");

    // rename package based on package.json's "name" field
    const rawPackageJson = await readFile(path.join(tempPackagePath, "package.json"));
    const packageName = JSON.parse(rawPackageJson).name;
    const newPackagePath = path.join(PACKAGES_DIRECTORY, packageName);
    await mkdir(newPackagePath, { force: true, recursive: true });
    await rename(tempPackagePath, newPackagePath);
}
