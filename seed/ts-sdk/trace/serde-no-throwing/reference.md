# Reference
## V2
<details><summary><code>client.v2.<a href="/src/api/resources/v2/client/Client.ts">test</a>() -> core.APIResponse<void, SeedTrace.v2.test.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.test();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `V2Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">updateTestSubmissionStatus</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.updateTestSubmissionStatus.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.updateTestSubmissionStatus("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
    type: "stopped"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.TestSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">sendTestSubmissionUpdate</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.sendTestSubmissionUpdate.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.sendTestSubmissionUpdate("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
    updateTime: new Date("2024-01-15T09:30:00.000Z"),
    updateInfo: {
        type: "running",
        value: "QUEUEING_SUBMISSION"
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.TestSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">updateWorkspaceSubmissionStatus</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.updateWorkspaceSubmissionStatus.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.updateWorkspaceSubmissionStatus("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
    type: "stopped"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.WorkspaceSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">sendWorkspaceSubmissionUpdate</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.sendWorkspaceSubmissionUpdate.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.sendWorkspaceSubmissionUpdate("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
    updateTime: new Date("2024-01-15T09:30:00.000Z"),
    updateInfo: {
        type: "running",
        value: "QUEUEING_SUBMISSION"
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.WorkspaceSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storeTracedTestCase</a>(submissionId, testCaseId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.storeTracedTestCase.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storeTracedTestCase("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", "testCaseId", {
    result: {
        result: {
            expectedResult: {
                type: "integerValue",
                value: 1
            },
            actualResult: {
                type: "value",
                value: {
                    type: "integerValue",
                    value: 1
                }
            },
            passed: true
        },
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            returnValue: {
                type: "integerValue",
                value: 1
            },
            expressionLocation: {
                start: 1,
                offset: 1
            },
            stack: {
                numStackFrames: 1,
                topStackFrame: {
                    methodName: "methodName",
                    lineNumber: 1,
                    scopes: [{
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }, {
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }]
                }
            },
            stdout: "stdout"
        }, {
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            returnValue: {
                type: "integerValue",
                value: 1
            },
            expressionLocation: {
                start: 1,
                offset: 1
            },
            stack: {
                numStackFrames: 1,
                topStackFrame: {
                    methodName: "methodName",
                    lineNumber: 1,
                    scopes: [{
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }, {
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }]
                }
            },
            stdout: "stdout"
        }]
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.StoreTracedTestCaseRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storeTracedTestCaseV2</a>(submissionId, testCaseId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.storeTracedTestCaseV2.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storeTracedTestCaseV2("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", "testCaseId", [{
        submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        lineNumber: 1,
        file: {
            filename: "filename",
            directory: "directory"
        },
        returnValue: {
            type: "integerValue",
            value: 1
        },
        expressionLocation: {
            start: 1,
            offset: 1
        },
        stack: {
            numStackFrames: 1,
            topStackFrame: {
                methodName: "methodName",
                lineNumber: 1,
                scopes: [{
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }, {
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }]
            }
        },
        stdout: "stdout"
    }, {
        submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        lineNumber: 1,
        file: {
            filename: "filename",
            directory: "directory"
        },
        returnValue: {
            type: "integerValue",
            value: 1
        },
        expressionLocation: {
            start: 1,
            offset: 1
        },
        stack: {
            numStackFrames: 1,
            topStackFrame: {
                methodName: "methodName",
                lineNumber: 1,
                scopes: [{
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }, {
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }]
            }
        },
        stdout: "stdout"
    }]);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `SeedTrace.TestCaseId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.TraceResponseV2[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storeTracedWorkspace</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.storeTracedWorkspace.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storeTracedWorkspace("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
    workspaceRunDetails: {
        exceptionV2: {
            type: "generic",
            exceptionType: "exceptionType",
            exceptionMessage: "exceptionMessage",
            exceptionStacktrace: "exceptionStacktrace"
        },
        exception: {
            exceptionType: "exceptionType",
            exceptionMessage: "exceptionMessage",
            exceptionStacktrace: "exceptionStacktrace"
        },
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            returnValue: {
                type: "integerValue",
                value: 1
            },
            expressionLocation: {
                start: 1,
                offset: 1
            },
            stack: {
                numStackFrames: 1,
                topStackFrame: {
                    methodName: "methodName",
                    lineNumber: 1,
                    scopes: [{
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }, {
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }]
                }
            },
            stdout: "stdout"
        }, {
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            returnValue: {
                type: "integerValue",
                value: 1
            },
            expressionLocation: {
                start: 1,
                offset: 1
            },
            stack: {
                numStackFrames: 1,
                topStackFrame: {
                    methodName: "methodName",
                    lineNumber: 1,
                    scopes: [{
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }, {
                            variables: {
                                "variables": {
                                    type: "integerValue",
                                    value: 1
                                }
                            }
                        }]
                }
            },
            stdout: "stdout"
        }]
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.StoreTracedWorkspaceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storeTracedWorkspaceV2</a>(submissionId, { ...params }) -> core.APIResponse<void, SeedTrace.admin.storeTracedWorkspaceV2.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storeTracedWorkspaceV2("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", [{
        submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        lineNumber: 1,
        file: {
            filename: "filename",
            directory: "directory"
        },
        returnValue: {
            type: "integerValue",
            value: 1
        },
        expressionLocation: {
            start: 1,
            offset: 1
        },
        stack: {
            numStackFrames: 1,
            topStackFrame: {
                methodName: "methodName",
                lineNumber: 1,
                scopes: [{
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }, {
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }]
            }
        },
        stdout: "stdout"
    }, {
        submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        lineNumber: 1,
        file: {
            filename: "filename",
            directory: "directory"
        },
        returnValue: {
            type: "integerValue",
            value: 1
        },
        expressionLocation: {
            start: 1,
            offset: 1
        },
        stack: {
            numStackFrames: 1,
            topStackFrame: {
                methodName: "methodName",
                lineNumber: 1,
                scopes: [{
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }, {
                        variables: {
                            "variables": {
                                type: "integerValue",
                                value: 1
                            }
                        }
                    }]
            }
        },
        stdout: "stdout"
    }]);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**submissionId:** `SeedTrace.SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.TraceResponseV2[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client/Client.ts">getHomepageProblems</a>() -> core.APIResponse<SeedTrace.ProblemId[], SeedTrace.homepage.getHomepageProblems.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.homepage.getHomepageProblems();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `HomepageClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client/Client.ts">setHomepageProblems</a>({ ...params }) -> core.APIResponse<void, SeedTrace.homepage.setHomepageProblems.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.homepage.setHomepageProblems(["string", "string"]);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedTrace.ProblemId[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HomepageClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.<a href="/src/api/resources/migration/client/Client.ts">getAttemptedMigrations</a>({ ...params }) -> core.APIResponse<SeedTrace.Migration[], SeedTrace.migration.getAttemptedMigrations.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.migration.getAttemptedMigrations({
    adminKeyHeader: "admin-key-header"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedTrace.GetAttemptedMigrationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MigrationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">createPlaylist</a>(serviceParam, { ...params }) -> core.APIResponse<SeedTrace.Playlist, SeedTrace.playlist.createPlaylist.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.playlist.createPlaylist(1, {
    datetime: new Date("2024-01-15T09:30:00.000Z"),
    optionalDatetime: new Date("2024-01-15T09:30:00.000Z"),
    body: {
        name: "name",
        problems: ["problems", "problems"]
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.CreatePlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">getPlaylists</a>(serviceParam, { ...params }) -> core.APIResponse<SeedTrace.Playlist[], SeedTrace.playlist.getPlaylists.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns the user's playlists
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.playlist.getPlaylists(1, {
    limit: 1,
    otherField: "otherField",
    multiLineDocs: "multiLineDocs",
    optionalMultipleField: "optionalMultipleField",
    multipleField: "multipleField"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.GetPlaylistsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">getPlaylist</a>(serviceParam, playlistId) -> core.APIResponse<SeedTrace.Playlist, SeedTrace.playlist.getPlaylist.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.playlist.getPlaylist(1, "playlistId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `SeedTrace.PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">updatePlaylist</a>(serviceParam, playlistId, { ...params }) -> core.APIResponse<SeedTrace.Playlist | undefined, SeedTrace.playlist.updatePlaylist.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.playlist.updatePlaylist(1, "playlistId", {
    name: "name",
    problems: ["problems", "problems"]
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `SeedTrace.PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.UpdatePlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">deletePlaylist</a>(serviceParam, playlist_id) -> core.APIResponse<void, SeedTrace.playlist.deletePlaylist.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a playlist
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.playlist.deletePlaylist(1, "playlist_id");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**serviceParam:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `SeedTrace.PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">createProblem</a>({ ...params }) -> core.APIResponse<SeedTrace.CreateProblemResponse, SeedTrace.problem.createProblem.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.problem.createProblem({
    problemName: "problemName",
    problemDescription: {
        boards: [{
                type: "html",
                value: "boards"
            }, {
                type: "html",
                value: "boards"
            }]
    },
    files: {
        ["JAVA"]: {
            solutionFile: {
                filename: "filename",
                contents: "contents"
            },
            readOnlyFiles: [{
                    filename: "filename",
                    contents: "contents"
                }, {
                    filename: "filename",
                    contents: "contents"
                }]
        }
    },
    inputParams: [{
            variableType: {
                type: "integerType"
            },
            name: "name"
        }, {
            variableType: {
                type: "integerType"
            },
            name: "name"
        }],
    outputType: {
        type: "integerType"
    },
    testcases: [{
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue",
                        value: 1
                    }, {
                        type: "integerValue",
                        value: 1
                    }]
            },
            expectedResult: {
                type: "integerValue",
                value: 1
            }
        }, {
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue",
                        value: 1
                    }, {
                        type: "integerValue",
                        value: 1
                    }]
            },
            expectedResult: {
                type: "integerValue",
                value: 1
            }
        }],
    methodName: "methodName"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedTrace.CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">updateProblem</a>(problemId, { ...params }) -> core.APIResponse<SeedTrace.UpdateProblemResponse, SeedTrace.problem.updateProblem.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.problem.updateProblem("problemId", {
    problemName: "problemName",
    problemDescription: {
        boards: [{
                type: "html",
                value: "boards"
            }, {
                type: "html",
                value: "boards"
            }]
    },
    files: {
        ["JAVA"]: {
            solutionFile: {
                filename: "filename",
                contents: "contents"
            },
            readOnlyFiles: [{
                    filename: "filename",
                    contents: "contents"
                }, {
                    filename: "filename",
                    contents: "contents"
                }]
        }
    },
    inputParams: [{
            variableType: {
                type: "integerType"
            },
            name: "name"
        }, {
            variableType: {
                type: "integerType"
            },
            name: "name"
        }],
    outputType: {
        type: "integerType"
    },
    testcases: [{
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue",
                        value: 1
                    }, {
                        type: "integerValue",
                        value: 1
                    }]
            },
            expectedResult: {
                type: "integerValue",
                value: 1
            }
        }, {
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue",
                        value: 1
                    }, {
                        type: "integerValue",
                        value: 1
                    }]
            },
            expectedResult: {
                type: "integerValue",
                value: 1
            }
        }],
    methodName: "methodName"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTrace.CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">deleteProblem</a>(problemId) -> core.APIResponse<void, SeedTrace.problem.deleteProblem.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Soft deletes a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.problem.deleteProblem("problemId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">getDefaultStarterFiles</a>({ ...params }) -> core.APIResponse<SeedTrace.GetDefaultStarterFilesResponse, SeedTrace.problem.getDefaultStarterFiles.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns default starter files for problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.problem.getDefaultStarterFiles({
    inputParams: [{
            variableType: {
                type: "integerType"
            },
            name: "name"
        }, {
            variableType: {
                type: "integerType"
            },
            name: "name"
        }],
    outputType: {
        type: "integerType"
    },
    methodName: "methodName"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedTrace.GetDefaultStarterFilesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">createExecutionSession</a>(language) -> core.APIResponse<SeedTrace.ExecutionSessionResponse, SeedTrace.submission.createExecutionSession.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns sessionId and execution server URL for session. Spins up server.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.submission.createExecutionSession("JAVA");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**language:** `SeedTrace.Language` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">getExecutionSession</a>(sessionId) -> core.APIResponse<SeedTrace.ExecutionSessionResponse | undefined, SeedTrace.submission.getExecutionSession.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns execution server URL for session. Returns empty if session isn't registered.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.submission.getExecutionSession("sessionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sessionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">stopExecutionSession</a>(sessionId) -> core.APIResponse<void, SeedTrace.submission.stopExecutionSession.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Stops execution session.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.submission.stopExecutionSession("sessionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sessionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">getExecutionSessionsState</a>() -> core.APIResponse<SeedTrace.GetExecutionSessionStateResponse, SeedTrace.submission.getExecutionSessionsState.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.submission.getExecutionSessionsState();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client/Client.ts">setNumWarmInstances</a>(language, numWarmInstances) -> core.APIResponse<void, SeedTrace.sysprop.setNumWarmInstances.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.sysprop.setNumWarmInstances("JAVA", 1);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**language:** `SeedTrace.Language` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SyspropClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client/Client.ts">getNumWarmInstances</a>() -> core.APIResponse<Record<SeedTrace.Language, number | undefined>, SeedTrace.sysprop.getNumWarmInstances.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.sysprop.getNumWarmInstances();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `SyspropClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.v2.problem.<a href="/src/api/resources/v2/resources/problem/client/Client.ts">getLightweightProblems</a>() -> core.APIResponse<SeedTrace.LightweightProblemInfoV2[], SeedTrace.v2.problem.getLightweightProblems.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns lightweight versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.problem.getLightweightProblems();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/src/api/resources/v2/resources/problem/client/Client.ts">getProblems</a>() -> core.APIResponse<SeedTrace.ProblemInfoV2[], SeedTrace.v2.problem.getProblems.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.problem.getProblems();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/src/api/resources/v2/resources/problem/client/Client.ts">getLatestProblem</a>(problemId) -> core.APIResponse<SeedTrace.ProblemInfoV2, SeedTrace.v2.problem.getLatestProblem.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.problem.getLatestProblem("problemId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.problem.<a href="/src/api/resources/v2/resources/problem/client/Client.ts">getProblemVersion</a>(problemId, problemVersion) -> core.APIResponse<SeedTrace.ProblemInfoV2, SeedTrace.v2.problem.getProblemVersion.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns requested version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.problem.getProblemVersion("problemId", 1);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.v2.v3.problem.<a href="/src/api/resources/v2/resources/v3/resources/problem/client/Client.ts">getLightweightProblems</a>() -> core.APIResponse<SeedTrace.LightweightProblemInfoV2[], SeedTrace.v2.v3.problem.getLightweightProblems.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns lightweight versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.v3.problem.getLightweightProblems();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/src/api/resources/v2/resources/v3/resources/problem/client/Client.ts">getProblems</a>() -> core.APIResponse<SeedTrace.ProblemInfoV2[], SeedTrace.v2.v3.problem.getProblems.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest versions of all problems
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.v3.problem.getProblems();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/src/api/resources/v2/resources/v3/resources/problem/client/Client.ts">getLatestProblem</a>(problemId) -> core.APIResponse<SeedTrace.ProblemInfoV2, SeedTrace.v2.v3.problem.getLatestProblem.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns latest version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.v3.problem.getLatestProblem("problemId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2.v3.problem.<a href="/src/api/resources/v2/resources/v3/resources/problem/client/Client.ts">getProblemVersion</a>(problemId, problemVersion) -> core.APIResponse<SeedTrace.ProblemInfoV2, SeedTrace.v2.v3.problem.getProblemVersion.Error></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns requested version of a problem
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.v2.v3.problem.getProblemVersion("problemId", 1);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**problemId:** `SeedTrace.ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
