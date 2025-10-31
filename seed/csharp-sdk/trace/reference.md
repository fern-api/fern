# Reference
## V2
<details><summary><code>client.V2.<a href="/src/SeedTrace/V2/V2Client.cs">TestAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.V2.TestAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">UpdateTestSubmissionStatusAsync</a>(submissionId, TestSubmissionStatus { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.UpdateTestSubmissionStatusAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new TestSubmissionStatus(new TestSubmissionStatus.Stopped())
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">SendTestSubmissionUpdateAsync</a>(submissionId, TestSubmissionUpdate { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.SendTestSubmissionUpdateAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new TestSubmissionUpdate
    {
        UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        UpdateInfo = new TestSubmissionUpdateInfo(
            new TestSubmissionUpdateInfo.Running(RunningSubmissionState.QueueingSubmission)
        ),
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">UpdateWorkspaceSubmissionStatusAsync</a>(submissionId, WorkspaceSubmissionStatus { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.UpdateWorkspaceSubmissionStatusAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new WorkspaceSubmissionStatus(new WorkspaceSubmissionStatus.Stopped())
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">SendWorkspaceSubmissionUpdateAsync</a>(submissionId, WorkspaceSubmissionUpdate { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.SendWorkspaceSubmissionUpdateAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new WorkspaceSubmissionUpdate
    {
        UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        UpdateInfo = new WorkspaceSubmissionUpdateInfo(
            new WorkspaceSubmissionUpdateInfo.Running(RunningSubmissionState.QueueingSubmission)
        ),
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedTestCaseAsync</a>(submissionId, testCaseId, StoreTracedTestCaseRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.StoreTracedTestCaseAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    "testCaseId",
    new StoreTracedTestCaseRequest
    {
        Result = new TestCaseResultWithStdout
        {
            Result = new TestCaseResult
            {
                ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
                ActualResult = new ActualResult(
                    new ActualResult.ValueInner(
                        new VariableValue(new VariableValue.IntegerValue(1))
                    )
                ),
                Passed = true,
            },
            Stdout = "stdout",
        },
        TraceResponses = new List<TraceResponse>()
        {
            new TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
                ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<Scope>()
                        {
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
            new TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
                ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<Scope>()
                        {
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
        },
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `StoreTracedTestCaseRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedTestCaseV2Async</a>(submissionId, testCaseId, IEnumerable<TraceResponseV2> { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.StoreTracedTestCaseV2Async(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    "testCaseId",
    new List<TraceResponseV2>()
    {
        new TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<Scope>()
                    {
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
        new TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<Scope>()
                    {
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `IEnumerable<TraceResponseV2>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedWorkspaceAsync</a>(submissionId, StoreTracedWorkspaceRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.StoreTracedWorkspaceAsync(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new StoreTracedWorkspaceRequest
    {
        WorkspaceRunDetails = new WorkspaceRunDetails
        {
            ExceptionV2 = new ExceptionV2(
                new ExceptionV2.Generic(
                    new ExceptionInfo
                    {
                        ExceptionType = "exceptionType",
                        ExceptionMessage = "exceptionMessage",
                        ExceptionStacktrace = "exceptionStacktrace",
                    }
                )
            ),
            Exception = new ExceptionInfo
            {
                ExceptionType = "exceptionType",
                ExceptionMessage = "exceptionMessage",
                ExceptionStacktrace = "exceptionStacktrace",
            },
            Stdout = "stdout",
        },
        TraceResponses = new List<TraceResponse>()
        {
            new TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
                ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<Scope>()
                        {
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
            new TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
                ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<Scope>()
                        {
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new Scope
                            {
                                Variables = new Dictionary<string, DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new DebugVariableValue(
                                            new DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
        },
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `StoreTracedWorkspaceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedWorkspaceV2Async</a>(submissionId, IEnumerable<TraceResponseV2> { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Admin.StoreTracedWorkspaceV2Async(
    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    new List<TraceResponseV2>()
    {
        new TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<Scope>()
                    {
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
        new TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new DebugVariableValue(new DebugVariableValue.IntegerValue(1)),
            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<Scope>()
                    {
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                        new Scope
                        {
                            Variables = new Dictionary<string, DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new DebugVariableValue(new DebugVariableValue.IntegerValue(1))
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
    }
);
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

**submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `IEnumerable<TraceResponseV2>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.Homepage.<a href="/src/SeedTrace/Homepage/HomepageClient.cs">GetHomepageProblemsAsync</a>() -> IEnumerable<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Homepage.GetHomepageProblemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Homepage.<a href="/src/SeedTrace/Homepage/HomepageClient.cs">SetHomepageProblemsAsync</a>(IEnumerable<string> { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Homepage.SetHomepageProblemsAsync(new List<string>() { "string", "string" });
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

**request:** `IEnumerable<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.Migration.<a href="/src/SeedTrace/Migration/MigrationClient.cs">GetAttemptedMigrationsAsync</a>(GetAttemptedMigrationsRequest { ... }) -> IEnumerable<Migration></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Migration.GetAttemptedMigrationsAsync(
    new GetAttemptedMigrationsRequest { AdminKeyHeader = "admin-key-header" }
);
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

**request:** `GetAttemptedMigrationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">CreatePlaylistAsync</a>(serviceParam, CreatePlaylistRequest { ... }) -> Playlist</code></summary>
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

```csharp
await client.Playlist.CreatePlaylistAsync(
    1,
    new CreatePlaylistRequest
    {
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        OptionalDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Body = new PlaylistCreateRequest
        {
            Name = "name",
            Problems = new List<string>() { "problems", "problems" },
        },
    }
);
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CreatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">GetPlaylistsAsync</a>(serviceParam, GetPlaylistsRequest { ... }) -> IEnumerable<Playlist></code></summary>
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

```csharp
await client.Playlist.GetPlaylistsAsync(
    1,
    new GetPlaylistsRequest
    {
        Limit = 1,
        OtherField = "otherField",
        MultiLineDocs = "multiLineDocs",
        OptionalMultipleField = ["optionalMultipleField"],
        MultipleField = ["multipleField"],
    }
);
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetPlaylistsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">GetPlaylistAsync</a>(serviceParam, playlistId) -> Playlist</code></summary>
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

```csharp
await client.Playlist.GetPlaylistAsync(1, "playlistId");
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">UpdatePlaylistAsync</a>(serviceParam, playlistId, UpdatePlaylistRequest? { ... }) -> Playlist?</code></summary>
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

```csharp
await client.Playlist.UpdatePlaylistAsync(
    1,
    "playlistId",
    new UpdatePlaylistRequest
    {
        Name = "name",
        Problems = new List<string>() { "problems", "problems" },
    }
);
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdatePlaylistRequest?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">DeletePlaylistAsync</a>(serviceParam, playlistId)</code></summary>
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

```csharp
await client.Playlist.DeletePlaylistAsync(1, "playlist_id");
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

**serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">CreateProblemAsync</a>(CreateProblemRequest { ... }) -> CreateProblemResponse</code></summary>
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

```csharp
await client.Problem.CreateProblemAsync(
    new CreateProblemRequest
    {
        ProblemName = "problemName",
        ProblemDescription = new ProblemDescription
        {
            Boards = new List<ProblemDescriptionBoard>()
            {
                new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
                new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
            },
        },
        Files = new Dictionary<Language, ProblemFiles>()
        {
            {
                Language.Java,
                new ProblemFiles
                {
                    SolutionFile = new SeedTrace.FileInfo
                    {
                        Filename = "filename",
                        Contents = "contents",
                    },
                    ReadOnlyFiles = new List<SeedTrace.FileInfo>()
                    {
                        new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
                        new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
                    },
                }
            },
        },
        InputParams = new List<VariableTypeAndName>()
        {
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new VariableType(new VariableType.IntegerType()),
        Testcases = new List<TestCaseWithExpectedResult>()
        {
            new TestCaseWithExpectedResult
            {
                TestCase = new TestCase
                {
                    Id = "id",
                    Params = new List<VariableValue>()
                    {
                        new VariableValue(new VariableValue.IntegerValue(1)),
                        new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
            },
            new TestCaseWithExpectedResult
            {
                TestCase = new TestCase
                {
                    Id = "id",
                    Params = new List<VariableValue>()
                    {
                        new VariableValue(new VariableValue.IntegerValue(1)),
                        new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
            },
        },
        MethodName = "methodName",
    }
);
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

**request:** `CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">UpdateProblemAsync</a>(problemId, CreateProblemRequest { ... }) -> UpdateProblemResponse</code></summary>
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

```csharp
await client.Problem.UpdateProblemAsync(
    "problemId",
    new CreateProblemRequest
    {
        ProblemName = "problemName",
        ProblemDescription = new ProblemDescription
        {
            Boards = new List<ProblemDescriptionBoard>()
            {
                new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
                new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
            },
        },
        Files = new Dictionary<Language, ProblemFiles>()
        {
            {
                Language.Java,
                new ProblemFiles
                {
                    SolutionFile = new SeedTrace.FileInfo
                    {
                        Filename = "filename",
                        Contents = "contents",
                    },
                    ReadOnlyFiles = new List<SeedTrace.FileInfo>()
                    {
                        new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
                        new SeedTrace.FileInfo { Filename = "filename", Contents = "contents" },
                    },
                }
            },
        },
        InputParams = new List<VariableTypeAndName>()
        {
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new VariableType(new VariableType.IntegerType()),
        Testcases = new List<TestCaseWithExpectedResult>()
        {
            new TestCaseWithExpectedResult
            {
                TestCase = new TestCase
                {
                    Id = "id",
                    Params = new List<VariableValue>()
                    {
                        new VariableValue(new VariableValue.IntegerValue(1)),
                        new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
            },
            new TestCaseWithExpectedResult
            {
                TestCase = new TestCase
                {
                    Id = "id",
                    Params = new List<VariableValue>()
                    {
                        new VariableValue(new VariableValue.IntegerValue(1)),
                        new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
            },
        },
        MethodName = "methodName",
    }
);
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

**problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">DeleteProblemAsync</a>(problemId)</code></summary>
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

```csharp
await client.Problem.DeleteProblemAsync("problemId");
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

**problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">GetDefaultStarterFilesAsync</a>(GetDefaultStarterFilesRequest { ... }) -> GetDefaultStarterFilesResponse</code></summary>
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

```csharp
await client.Problem.GetDefaultStarterFilesAsync(
    new GetDefaultStarterFilesRequest
    {
        InputParams = new List<VariableTypeAndName>()
        {
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
            new VariableTypeAndName
            {
                VariableType = new VariableType(new VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new VariableType(new VariableType.IntegerType()),
        MethodName = "methodName",
    }
);
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

**request:** `GetDefaultStarterFilesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">CreateExecutionSessionAsync</a>(language) -> ExecutionSessionResponse</code></summary>
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

```csharp
await client.Submission.CreateExecutionSessionAsync(Language.Java);
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

**language:** `Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">GetExecutionSessionAsync</a>(sessionId) -> ExecutionSessionResponse?</code></summary>
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

```csharp
await client.Submission.GetExecutionSessionAsync("sessionId");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">StopExecutionSessionAsync</a>(sessionId)</code></summary>
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

```csharp
await client.Submission.StopExecutionSessionAsync("sessionId");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">GetExecutionSessionsStateAsync</a>() -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Submission.GetExecutionSessionsStateAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.Sysprop.<a href="/src/SeedTrace/Sysprop/SyspropClient.cs">SetNumWarmInstancesAsync</a>(language, numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Sysprop.SetNumWarmInstancesAsync(Language.Java, 1);
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

**language:** `Language` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Sysprop.<a href="/src/SeedTrace/Sysprop/SyspropClient.cs">GetNumWarmInstancesAsync</a>() -> Dictionary<Language, int></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Sysprop.GetNumWarmInstancesAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetLightweightProblemsAsync</a>() -> IEnumerable<LightweightProblemInfoV2></code></summary>
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

```csharp
await client.V2.Problem.GetLightweightProblemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetProblemsAsync</a>() -> IEnumerable<ProblemInfoV2></code></summary>
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

```csharp
await client.V2.Problem.GetProblemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetLatestProblemAsync</a>(problemId) -> ProblemInfoV2</code></summary>
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

```csharp
await client.V2.Problem.GetLatestProblemAsync("problemId");
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

**problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetProblemVersionAsync</a>(problemId, problemVersion) -> ProblemInfoV2</code></summary>
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

```csharp
await client.V2.Problem.GetProblemVersionAsync("problemId", 1);
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

**problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetLightweightProblemsAsync</a>() -> IEnumerable<LightweightProblemInfoV2></code></summary>
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

```csharp
await client.V2.V3.Problem.GetLightweightProblemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetProblemsAsync</a>() -> IEnumerable<ProblemInfoV2></code></summary>
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

```csharp
await client.V2.V3.Problem.GetProblemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetLatestProblemAsync</a>(problemId) -> ProblemInfoV2</code></summary>
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

```csharp
await client.V2.V3.Problem.GetLatestProblemAsync("problemId");
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

**problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetProblemVersionAsync</a>(problemId, problemVersion) -> ProblemInfoV2</code></summary>
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

```csharp
await client.V2.V3.Problem.GetProblemVersionAsync("problemId", 1);
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

**problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
