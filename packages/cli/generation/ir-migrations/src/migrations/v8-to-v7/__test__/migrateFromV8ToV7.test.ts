import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V8_TO_V7_MIGRATION } from "../migrateFromV8ToV7";

const runMigration = createMigrationTester(V8_TO_V7_MIGRATION);

describe("migrateFromV8ToV7", () => {
    it("adds name to services", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });
        expect(migrated.ir.types).toEqual([
            {
                availability: {
                    message: undefined,
                    status: "GENERAL_AVAILABILITY"
                },
                docs: undefined,
                examples: [],
                name: {
                    fernFilepath: [
                        {
                            camelCase: {
                                safeName: "folder",
                                unsafeName: "folder"
                            },
                            originalName: "folder",
                            pascalCase: {
                                safeName: "Folder",
                                unsafeName: "Folder"
                            },
                            screamingSnakeCase: {
                                safeName: "FOLDER",
                                unsafeName: "FOLDER"
                            },
                            snakeCase: {
                                safeName: "folder",
                                unsafeName: "folder"
                            }
                        }
                    ],
                    name: {
                        camelCase: {
                            safeName: "folderType",
                            unsafeName: "folderType"
                        },
                        originalName: "FolderType",
                        pascalCase: {
                            safeName: "FolderType",
                            unsafeName: "FolderType"
                        },
                        screamingSnakeCase: {
                            safeName: "FOLDER_TYPE",
                            unsafeName: "FOLDER_TYPE"
                        },
                        snakeCase: {
                            safeName: "folder_type",
                            unsafeName: "folder_type"
                        }
                    }
                },
                referencedTypes: [],
                shape: {
                    _type: "alias",
                    aliasOf: {
                        _type: "primitive",
                        primitive: "STRING"
                    },
                    resolvedType: {
                        _type: "primitive",
                        primitive: "STRING"
                    }
                }
            },
            {
                availability: {
                    message: undefined,
                    status: "GENERAL_AVAILABILITY"
                },
                docs: undefined,
                examples: [],
                name: {
                    fernFilepath: [
                        {
                            camelCase: {
                                safeName: "file",
                                unsafeName: "file"
                            },
                            originalName: "file",
                            pascalCase: {
                                safeName: "File",
                                unsafeName: "File"
                            },
                            screamingSnakeCase: {
                                safeName: "FILE",
                                unsafeName: "FILE"
                            },
                            snakeCase: {
                                safeName: "file",
                                unsafeName: "file"
                            }
                        }
                    ],
                    name: {
                        camelCase: {
                            safeName: "fileType",
                            unsafeName: "fileType"
                        },
                        originalName: "FileType",
                        pascalCase: {
                            safeName: "FileType",
                            unsafeName: "FileType"
                        },
                        screamingSnakeCase: {
                            safeName: "FILE_TYPE",
                            unsafeName: "FILE_TYPE"
                        },
                        snakeCase: {
                            safeName: "file_type",
                            unsafeName: "file_type"
                        }
                    }
                },
                referencedTypes: [],
                shape: {
                    _type: "alias",
                    aliasOf: {
                        _type: "primitive",
                        primitive: "STRING"
                    },
                    resolvedType: {
                        _type: "primitive",
                        primitive: "STRING"
                    }
                }
            },
            {
                availability: {
                    message: undefined,
                    status: "GENERAL_AVAILABILITY"
                },
                docs: undefined,
                examples: [],
                name: {
                    fernFilepath: [
                        {
                            camelCase: {
                                safeName: "folder",
                                unsafeName: "folder"
                            },
                            originalName: "folder",
                            pascalCase: {
                                safeName: "Folder",
                                unsafeName: "Folder"
                            },
                            screamingSnakeCase: {
                                safeName: "FOLDER",
                                unsafeName: "FOLDER"
                            },
                            snakeCase: {
                                safeName: "folder",
                                unsafeName: "folder"
                            }
                        },
                        {
                            camelCase: {
                                safeName: "nestedFile",
                                unsafeName: "nestedFile"
                            },
                            originalName: "nestedFile",
                            pascalCase: {
                                safeName: "NestedFile",
                                unsafeName: "NestedFile"
                            },
                            screamingSnakeCase: {
                                safeName: "NESTED_FILE",
                                unsafeName: "NESTED_FILE"
                            },
                            snakeCase: {
                                safeName: "nested_file",
                                unsafeName: "nested_file"
                            }
                        }
                    ],
                    name: {
                        camelCase: {
                            safeName: "nestedFileType",
                            unsafeName: "nestedFileType"
                        },
                        originalName: "NestedFileType",
                        pascalCase: {
                            safeName: "NestedFileType",
                            unsafeName: "NestedFileType"
                        },
                        screamingSnakeCase: {
                            safeName: "NESTED_FILE_TYPE",
                            unsafeName: "NESTED_FILE_TYPE"
                        },
                        snakeCase: {
                            safeName: "nested_file_type",
                            unsafeName: "nested_file_type"
                        }
                    }
                },
                referencedTypes: [],
                shape: {
                    _type: "alias",
                    aliasOf: {
                        _type: "primitive",
                        primitive: "STRING"
                    },
                    resolvedType: {
                        _type: "primitive",
                        primitive: "STRING"
                    }
                }
            }
        ]);
    });
});
