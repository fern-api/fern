import { readdir, readFile } from "fs/promises";
import path from "path";
import { FileSystem, FileType } from "./FileSystem";
import { FileSystemWithUtilities } from "./FileSystemWithUtilities";

type Node = DirectoryNode | FileNode;

interface DirectoryNode {
    name: FileSystem.FileName;
    type: FileType.DIRECTORY;
    children: Loadable<Record<FileSystem.FileName, Node>>;
}

interface FileNode {
    name: FileSystem.FileName;
    type: FileType.FILE;
    contents: Loadable<FileContents>;
}

interface FileContents {
    originalContents?: string;
    newContents?: string;
}

export class LazyVirtualFileSystem implements FileSystemWithUtilities {
    private root = getDefaultRoot();

    constructor(private readonly rootDir: string) {}

    public async readdir(relativePath: string): Promise<Record<FileSystem.FileName, FileSystem.File>> {
        const contents = await this.readdirRecursive(this.root, [], path.normalize(relativePath).split(path.sep));

        const toReturn: Record<FileSystem.FileName, FileSystem.File> = {};
        for (const [filename, node] of Object.entries(contents)) {
            toReturn[filename] = {
                name: node.name,
                type: node.type,
            };
        }

        return toReturn;
    }

    public async mkdir(relativePath: string): Promise<void> {
        await this.mkdirRecursive(this.root, [], path.normalize(relativePath).split(path.sep));
    }

    public async readFile(relativePath: string): Promise<string | undefined> {
        const fileContents = await this.traverseToFile(relativePath);
        if (fileContents == null) {
            return undefined;
        }
        return fileContents.newContents ?? fileContents.originalContents;
    }

    public async writeFile(relativePath: string, contents: string): Promise<void> {
        await this.traverseToFile(relativePath, { replaceWith: contents });
    }

    public getFileSystemForPrefix(prefix: string): FileSystem {
        return {
            readFile: (relativePath) => this.readFile(path.join(prefix, relativePath)),
            writeFile: (relativePath, contents) => this.writeFile(path.join(prefix, relativePath), contents),
            readdir: (relativePath) => this.readdir(path.join(prefix, relativePath)),
            mkdir: (relativePath) => this.mkdir(path.join(prefix, relativePath)),
            getFileSystemForPrefix: (nextPrefix) => this.getFileSystemForPrefix(path.join(prefix, nextPrefix)),
        };
    }

    public async visitTouchedFiles(
        visitor: (args: { fullPath: string; relativePath: string; contents: string }) => void | Promise<void>
    ): Promise<void> {
        const touchedFiles = this.getTouchedFiles();
        for (const changedFile of touchedFiles) {
            await visitor({
                fullPath: changedFile.fullPath,
                relativePath: changedFile.relativePath,
                contents: changedFile.newContents,
            });
        }
    }

    public getTouchedFiles(): FileSystemWithUtilities.TouchedFile[] {
        return this.getTouchedFilesRecursive("", this.root);
    }

    public clearCache(): void {
        this.root = getDefaultRoot();
    }

    private async readdirRecursive(
        currentNode: DirectoryNode,
        currentPath: FileSystem.FileName[],
        remainingPath: FileSystem.FileName[]
    ): Promise<Record<string, Node>> {
        if (!currentNode.children.isLoaded) {
            currentNode.children = {
                isLoaded: true,
                value: await this.loadChildren(currentPath.join(path.sep)),
            };
        }

        const [nextPathPart, ...restOfRemainingPath] = remainingPath;
        if (nextPathPart == null) {
            return currentNode.children.value;
        }
        if (nextPathPart === ".") {
            if (restOfRemainingPath.length === 0) {
                return currentNode.children.value;
            } else {
                throw new Error(`Invalid path: ${path.join(...currentPath, nextPathPart)}`);
            }
        }

        const child = currentNode.children.value[nextPathPart];
        if (child == null) {
            throw new Error(`Path does not exist: ${path.join(...currentPath, nextPathPart)}`);
        }
        if (child.type !== FileType.DIRECTORY) {
            throw new Error(`Path is not a directory: ${path.join(...currentPath, nextPathPart)}`);
        }
        return this.readdirRecursive(child, [...currentPath, nextPathPart], restOfRemainingPath);
    }

    private async loadChildren(relativePath: string): Promise<Record<string, Node>> {
        const newChildren = await readdir(this.getAbsolutePath(relativePath), {
            withFileTypes: true,
        });

        // TODO don't modify, make immutable
        return newChildren.reduce<Record<FileSystem.FileName, Node>>((acc, child) => {
            if (child.isFile()) {
                acc[child.name] = {
                    type: FileType.FILE,
                    name: child.name,
                    contents: { isLoaded: false },
                };
            } else if (child.isDirectory()) {
                acc[child.name] = {
                    type: FileType.DIRECTORY,
                    name: child.name,
                    children: { isLoaded: false },
                };
            }
            return acc;
        }, {});
    }

    private async mkdirRecursive(
        currentNode: DirectoryNode,
        currentPath: FileSystem.FileName[],
        remainingPath: FileSystem.FileName[]
    ): Promise<void> {
        const [nextDir, ...restOfRemainingDirs] = remainingPath;
        if (nextDir == null) {
            return;
        }

        if (!currentNode.children.isLoaded) {
            currentNode.children = {
                isLoaded: true,
                value: await this.loadChildren(currentPath.join(path.sep)),
            };
        }

        let existingFileForNextDir = currentNode.children.value[nextDir];
        if (existingFileForNextDir == null) {
            existingFileForNextDir = {
                name: nextDir,
                type: FileType.DIRECTORY,
                children: { isLoaded: false },
            };
            currentNode.children.value[nextDir] = existingFileForNextDir;
        }

        if (existingFileForNextDir.type === FileType.FILE) {
            throw new Error(`Path is not a directory: ${path.join(...currentPath, nextDir)}`);
        }

        return this.mkdirRecursive(existingFileForNextDir, [...currentPath, nextDir], restOfRemainingDirs);
    }

    private async traverseToFile(
        relativePath: string,
        { replaceWith }: { replaceWith?: string } = {}
    ): Promise<FileContents | undefined> {
        const pathParts = path.normalize(relativePath).split(path.sep);
        const filename = pathParts.pop();
        if (filename == null) {
            throw new Error(`Invalid path: ${relativePath}`);
        }

        const containingDirectory = await this.readdirRecursive(this.root, [], pathParts);
        const fileNode = containingDirectory[filename];

        if (fileNode == null) {
            if (replaceWith == null) {
                return undefined;
            }
            const newFileContents = {
                originalContents: undefined,
                newContents: replaceWith,
            };

            containingDirectory[filename] = {
                type: FileType.FILE,
                name: filename,
                contents: { isLoaded: true, value: newFileContents },
            };

            return newFileContents;
        }

        if (fileNode.type !== FileType.FILE) {
            throw new Error(`Path is not a regular file: ${relativePath}`);
        }

        let fileContents: FileContents;
        if (fileNode.contents.isLoaded) {
            fileContents = fileNode.contents.value;
        } else {
            const fileContentsBuffer = await readFile(this.getAbsolutePath(relativePath));
            fileContents = { originalContents: fileContentsBuffer.toString() };
        }

        if (replaceWith != null) {
            fileNode.contents = {
                isLoaded: true,
                value: {
                    ...fileContents,
                    newContents: replaceWith,
                },
            };
        }

        return fileContents;
    }

    private getTouchedFilesRecursive(
        currentPath: string,
        directory: DirectoryNode
    ): FileSystemWithUtilities.TouchedFile[] {
        if (!directory.children.isLoaded) {
            return [];
        }
        return Object.values(directory.children.value).flatMap((child) => {
            switch (child.type) {
                case FileType.DIRECTORY:
                    return this.getTouchedFilesRecursive(path.join(currentPath, child.name), child);
                case FileType.FILE: {
                    if (!child.contents.isLoaded || child.contents.value.newContents == null) {
                        return [];
                    }
                    const relativePath = path.join(currentPath, child.name);
                    return {
                        fullPath: this.getAbsolutePath(relativePath),
                        relativePath,
                        originalContents: child.contents.value.originalContents,
                        newContents: child.contents.value.newContents,
                    };
                }
            }
        });
    }

    private getAbsolutePath(relativePath: string) {
        return path.join(this.rootDir, relativePath);
    }
}

function getDefaultRoot(): DirectoryNode {
    return {
        type: FileType.DIRECTORY,
        name: "root",
        children: { isLoaded: false },
    };
}

type Loadable<T> = { isLoaded: false } | { isLoaded: true; value: T };
