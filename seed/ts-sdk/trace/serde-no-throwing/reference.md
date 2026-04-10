# Reference
## V2
<details><summary><code>client.v2.<a href="/src/api/resources/v2/client/Client.ts">test</a>() -> core.APIResponse&lt;void, SeedApi.v2.test.Error&gt;</code></summary>
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
<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">updatetestsubmissionstatus</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.updatetestsubmissionstatus.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.updatetestsubmissionstatus({
    submissionId: "submissionId",
    body: {
        type: "stopped"
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

**request:** `SeedApi.AdminUpdateTestSubmissionStatusRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">sendtestsubmissionupdate</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.sendtestsubmissionupdate.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.sendtestsubmissionupdate({
    submissionId: "submissionId",
    body: {
        updateTime: new Date("2024-01-15T09:30:00.000Z"),
        updateInfo: {
            type: "running"
        }
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

**request:** `SeedApi.AdminSendTestSubmissionUpdateRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">updateworkspacesubmissionstatus</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.updateworkspacesubmissionstatus.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.updateworkspacesubmissionstatus({
    submissionId: "submissionId",
    body: {
        type: "stopped"
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

**request:** `SeedApi.AdminUpdateWorkspaceSubmissionStatusRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">sendworkspacesubmissionupdate</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.sendworkspacesubmissionupdate.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.sendworkspacesubmissionupdate({
    submissionId: "submissionId",
    body: {
        updateTime: new Date("2024-01-15T09:30:00.000Z"),
        updateInfo: {
            type: "running"
        }
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

**request:** `SeedApi.AdminSendWorkspaceSubmissionUpdateRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storetracedtestcase</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.storetracedtestcase.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storetracedtestcase({
    submissionId: "submissionId",
    testCaseId: "testCaseId",
    result: {
        result: {
            expectedResult: {
                type: "integerValue"
            },
            actualResult: {
                type: "value"
            },
            passed: true
        },
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "submissionId",
            lineNumber: 1,
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.AdminStoreTracedTestCaseRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storetracedtestcasev2</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.storetracedtestcasev2.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storetracedtestcasev2({
    submissionId: "submissionId",
    testCaseId: "testCaseId",
    body: [{
            submissionId: "submissionId",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory"
            },
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.AdminStoreTracedTestCaseV2Request` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storetracedworkspace</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.storetracedworkspace.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storetracedworkspace({
    submissionId: "submissionId",
    workspaceRunDetails: {
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "submissionId",
            lineNumber: 1,
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.AdminStoreTracedWorkspaceRequest` 
    
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

<details><summary><code>client.admin.<a href="/src/api/resources/admin/client/Client.ts">storetracedworkspacev2</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.admin.storetracedworkspacev2.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.admin.storetracedworkspacev2({
    submissionId: "submissionId",
    body: [{
            submissionId: "submissionId",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory"
            },
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.AdminStoreTracedWorkspaceV2Request` 
    
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
<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client/Client.ts">gethomepageproblems</a>() -> core.APIResponse&lt;SeedApi.ProblemId[], SeedApi.homepage.gethomepageproblems.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.homepage.gethomepageproblems();

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

<details><summary><code>client.homepage.<a href="/src/api/resources/homepage/client/Client.ts">sethomepageproblems</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.homepage.sethomepageproblems.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.homepage.sethomepageproblems(["string"]);

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

**request:** `SeedApi.ProblemId[]` 
    
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
<details><summary><code>client.migration.<a href="/src/api/resources/migration/client/Client.ts">getattemptedmigrations</a>({ ...params }) -> core.APIResponse&lt;SeedApi.Migration[], SeedApi.migration.getattemptedmigrations.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.migration.getattemptedmigrations({
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

**request:** `SeedApi.MigrationGetAttemptedMigrationsRequest` 
    
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
<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">createplaylist</a>({ ...params }) -> core.APIResponse&lt;SeedApi.Playlist, SeedApi.playlist.createplaylist.Error&gt;</code></summary>
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
await client.playlist.createplaylist({
    serviceParam: 1,
    datetime: new Date("2024-01-15T09:30:00.000Z"),
    body: {
        name: "name",
        problems: ["problems"]
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

**request:** `SeedApi.PlaylistCreatePlaylistRequest` 
    
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

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">getplaylists</a>({ ...params }) -> core.APIResponse&lt;SeedApi.Playlist[], SeedApi.playlist.getplaylists.Error&gt;</code></summary>
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
await client.playlist.getplaylists({
    serviceParam: 1,
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

**request:** `SeedApi.PlaylistGetPlaylistsRequest` 
    
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

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">getplaylist</a>({ ...params }) -> core.APIResponse&lt;SeedApi.Playlist, SeedApi.playlist.getplaylist.Error&gt;</code></summary>
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
await client.playlist.getplaylist({
    serviceParam: 1,
    playlistId: "playlistId"
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

**request:** `SeedApi.PlaylistGetPlaylistRequest` 
    
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

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">updateplaylist</a>({ ...params }) -> core.APIResponse&lt;SeedApi.Playlist, SeedApi.playlist.updateplaylist.Error&gt;</code></summary>
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
await client.playlist.updateplaylist({
    serviceParam: 1,
    playlistId: "playlistId",
    name: "name",
    problems: ["problems"]
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

**request:** `SeedApi.UpdatePlaylistRequest` 
    
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

<details><summary><code>client.playlist.<a href="/src/api/resources/playlist/client/Client.ts">deleteplaylist</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.playlist.deleteplaylist.Error&gt;</code></summary>
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
await client.playlist.deleteplaylist({
    serviceParam: 1,
    playlistId: "playlist_id"
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

**request:** `SeedApi.PlaylistDeletePlaylistRequest` 
    
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
<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">createproblem</a>({ ...params }) -> core.APIResponse&lt;SeedApi.CreateProblemResponse, SeedApi.problem.createproblem.Error&gt;</code></summary>
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
await client.problem.createproblem({
    problemName: "problemName",
    problemDescription: {
        boards: [{
                type: "html"
            }]
    },
    files: {
        "key": {
            solutionFile: {
                filename: "filename",
                contents: "contents"
            },
            readOnlyFiles: [{
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
        }],
    outputType: {
        type: "integerType"
    },
    testcases: [{
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue"
                    }]
            },
            expectedResult: {
                type: "integerValue"
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

**request:** `SeedApi.CreateProblemRequest` 
    
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">updateproblem</a>({ ...params }) -> core.APIResponse&lt;SeedApi.UpdateProblemResponse, SeedApi.problem.updateproblem.Error&gt;</code></summary>
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
await client.problem.updateproblem({
    problemId: "problemId",
    body: {
        problemName: "problemName",
        problemDescription: {
            boards: [{
                    type: "html"
                }]
        },
        files: {
            "key": {
                solutionFile: {
                    filename: "filename",
                    contents: "contents"
                },
                readOnlyFiles: [{
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
            }],
        outputType: {
            type: "integerType"
        },
        testcases: [{
                testCase: {
                    id: "id",
                    params: [{
                            type: "integerValue"
                        }]
                },
                expectedResult: {
                    type: "integerValue"
                }
            }],
        methodName: "methodName"
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

**request:** `SeedApi.ProblemUpdateProblemRequest` 
    
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">deleteproblem</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.problem.deleteproblem.Error&gt;</code></summary>
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
await client.problem.deleteproblem({
    problemId: "problemId"
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

**request:** `SeedApi.ProblemDeleteProblemRequest` 
    
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

<details><summary><code>client.problem.<a href="/src/api/resources/problem/client/Client.ts">getdefaultstarterfiles</a>({ ...params }) -> core.APIResponse&lt;SeedApi.GetDefaultStarterFilesResponse, SeedApi.problem.getdefaultstarterfiles.Error&gt;</code></summary>
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
await client.problem.getdefaultstarterfiles({
    inputParams: [{
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

**request:** `SeedApi.ProblemGetDefaultStarterFilesRequest` 
    
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
<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">createexecutionsession</a>({ ...params }) -> core.APIResponse&lt;SeedApi.ExecutionSessionResponse, SeedApi.submission.createexecutionsession.Error&gt;</code></summary>
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
await client.submission.createexecutionsession({
    language: "JAVA"
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

**request:** `SeedApi.SubmissionCreateExecutionSessionRequest` 
    
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">getexecutionsession</a>({ ...params }) -> core.APIResponse&lt;SeedApi.ExecutionSessionResponse, SeedApi.submission.getexecutionsession.Error&gt;</code></summary>
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
await client.submission.getexecutionsession({
    sessionId: "sessionId"
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

**request:** `SeedApi.SubmissionGetExecutionSessionRequest` 
    
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">stopexecutionsession</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.submission.stopexecutionsession.Error&gt;</code></summary>
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
await client.submission.stopexecutionsession({
    sessionId: "sessionId"
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

**request:** `SeedApi.SubmissionStopExecutionSessionRequest` 
    
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

<details><summary><code>client.submission.<a href="/src/api/resources/submission/client/Client.ts">getexecutionsessionsstate</a>() -> core.APIResponse&lt;SeedApi.GetExecutionSessionStateResponse, SeedApi.submission.getexecutionsessionsstate.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.submission.getexecutionsessionsstate();

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
<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client/Client.ts">setnumwarminstances</a>({ ...params }) -> core.APIResponse&lt;void, SeedApi.sysprop.setnumwarminstances.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.sysprop.setnumwarminstances({
    language: "JAVA",
    numWarmInstances: 1
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

**request:** `SeedApi.SyspropSetNumWarmInstancesRequest` 
    
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

<details><summary><code>client.sysprop.<a href="/src/api/resources/sysprop/client/Client.ts">getnumwarminstances</a>() -> core.APIResponse&lt;Record&lt;string, number&gt;, SeedApi.sysprop.getnumwarminstances.Error&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.sysprop.getnumwarminstances();

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

## V2Problem
<details><summary><code>client.v2Problem.<a href="/src/api/resources/v2Problem/client/Client.ts">v2ProblemGetLightweightProblems</a>() -> core.APIResponse&lt;SeedApi.V2LightweightProblemInfoV2[], SeedApi.v2Problem.v2ProblemGetLightweightProblems.Error&gt;</code></summary>
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
await client.v2Problem.v2ProblemGetLightweightProblems();

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

**requestOptions:** `V2ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.<a href="/src/api/resources/v2Problem/client/Client.ts">v2ProblemGetProblems</a>() -> core.APIResponse&lt;SeedApi.V2ProblemInfoV2[], SeedApi.v2Problem.v2ProblemGetProblems.Error&gt;</code></summary>
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
await client.v2Problem.v2ProblemGetProblems();

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

**requestOptions:** `V2ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.<a href="/src/api/resources/v2Problem/client/Client.ts">v2ProblemGetLatestProblem</a>({ ...params }) -> core.APIResponse&lt;SeedApi.V2ProblemInfoV2, SeedApi.v2Problem.v2ProblemGetLatestProblem.Error&gt;</code></summary>
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
await client.v2Problem.v2ProblemGetLatestProblem({
    problemId: "problemId"
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

**request:** `SeedApi.V2ProblemGetLatestProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `V2ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2Problem.<a href="/src/api/resources/v2Problem/client/Client.ts">v2ProblemGetProblemVersion</a>({ ...params }) -> core.APIResponse&lt;SeedApi.V2ProblemInfoV2, SeedApi.v2Problem.v2ProblemGetProblemVersion.Error&gt;</code></summary>
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
await client.v2Problem.v2ProblemGetProblemVersion({
    problemId: "problemId",
    problemVersion: 1
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

**request:** `SeedApi.V2ProblemGetProblemVersionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `V2ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2V3Problem
<details><summary><code>client.v2V3Problem.<a href="/src/api/resources/v2V3Problem/client/Client.ts">v2V3ProblemGetLightweightProblems</a>() -> core.APIResponse&lt;SeedApi.V2V3LightweightProblemInfoV2[], SeedApi.v2V3Problem.v2V3ProblemGetLightweightProblems.Error&gt;</code></summary>
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
await client.v2V3Problem.v2V3ProblemGetLightweightProblems();

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

**requestOptions:** `V2V3ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.<a href="/src/api/resources/v2V3Problem/client/Client.ts">v2V3ProblemGetProblems</a>() -> core.APIResponse&lt;SeedApi.V2V3ProblemInfoV2[], SeedApi.v2V3Problem.v2V3ProblemGetProblems.Error&gt;</code></summary>
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
await client.v2V3Problem.v2V3ProblemGetProblems();

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

**requestOptions:** `V2V3ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.<a href="/src/api/resources/v2V3Problem/client/Client.ts">v2V3ProblemGetLatestProblem</a>({ ...params }) -> core.APIResponse&lt;SeedApi.V2V3ProblemInfoV2, SeedApi.v2V3Problem.v2V3ProblemGetLatestProblem.Error&gt;</code></summary>
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
await client.v2V3Problem.v2V3ProblemGetLatestProblem({
    problemId: "problemId"
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

**request:** `SeedApi.V2V3ProblemGetLatestProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `V2V3ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2V3Problem.<a href="/src/api/resources/v2V3Problem/client/Client.ts">v2V3ProblemGetProblemVersion</a>({ ...params }) -> core.APIResponse&lt;SeedApi.V2V3ProblemInfoV2, SeedApi.v2V3Problem.v2V3ProblemGetProblemVersion.Error&gt;</code></summary>
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
await client.v2V3Problem.v2V3ProblemGetProblemVersion({
    problemId: "problemId",
    problemVersion: 1
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

**request:** `SeedApi.V2V3ProblemGetProblemVersionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `V2V3ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

