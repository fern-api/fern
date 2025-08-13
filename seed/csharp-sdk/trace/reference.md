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
<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">UpdateTestSubmissionStatusAsync</a>(submissionId, SeedTrace.TestSubmissionStatus { ... })</code></summary>
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
    new SeedTrace.TestSubmissionStatus(new SeedTrace.TestSubmissionStatus.Stopped())
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

**request:** `SeedTrace.TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">SendTestSubmissionUpdateAsync</a>(submissionId, SeedTrace.TestSubmissionUpdate { ... })</code></summary>
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
    new SeedTrace.TestSubmissionUpdate
    {
        UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        UpdateInfo = new SeedTrace.TestSubmissionUpdateInfo(
            new SeedTrace.TestSubmissionUpdateInfo.Running(
                SeedTrace.RunningSubmissionState.QueueingSubmission
            )
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

**request:** `SeedTrace.TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">UpdateWorkspaceSubmissionStatusAsync</a>(submissionId, SeedTrace.WorkspaceSubmissionStatus { ... })</code></summary>
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
    new SeedTrace.WorkspaceSubmissionStatus(new SeedTrace.WorkspaceSubmissionStatus.Stopped())
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

**request:** `SeedTrace.WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">SendWorkspaceSubmissionUpdateAsync</a>(submissionId, SeedTrace.WorkspaceSubmissionUpdate { ... })</code></summary>
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
    new SeedTrace.WorkspaceSubmissionUpdate
    {
        UpdateTime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        UpdateInfo = new SeedTrace.WorkspaceSubmissionUpdateInfo(
            new SeedTrace.WorkspaceSubmissionUpdateInfo.Running(
                SeedTrace.RunningSubmissionState.QueueingSubmission
            )
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

**request:** `SeedTrace.WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedTestCaseAsync</a>(submissionId, testCaseId, SeedTrace.StoreTracedTestCaseRequest { ... })</code></summary>
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
    new SeedTrace.StoreTracedTestCaseRequest
    {
        Result = new SeedTrace.TestCaseResultWithStdout
        {
            Result = new SeedTrace.TestCaseResult
            {
                ExpectedResult = new SeedTrace.VariableValue(
                    new SeedTrace.VariableValue.IntegerValue(1)
                ),
                ActualResult = new SeedTrace.ActualResult(
                    new SeedTrace.ActualResult.ValueInner(
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1))
                    )
                ),
                Passed = true,
            },
            Stdout = "stdout",
        },
        TraceResponses = new List<SeedTrace.TraceResponse>()
        {
            new SeedTrace.TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new SeedTrace.DebugVariableValue(
                    new SeedTrace.DebugVariableValue.IntegerValue(1)
                ),
                ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new SeedTrace.StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new SeedTrace.StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<SeedTrace.Scope>()
                        {
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
            new SeedTrace.TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new SeedTrace.DebugVariableValue(
                    new SeedTrace.DebugVariableValue.IntegerValue(1)
                ),
                ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new SeedTrace.StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new SeedTrace.StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<SeedTrace.Scope>()
                        {
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
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

**request:** `SeedTrace.StoreTracedTestCaseRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedTestCaseV2Async</a>(submissionId, testCaseId, IEnumerable<SeedTrace.TraceResponseV2> { ... })</code></summary>
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
    new List<SeedTrace.TraceResponseV2>()
    {
        new SeedTrace.TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new SeedTrace.DebugVariableValue(
                new SeedTrace.DebugVariableValue.IntegerValue(1)
            ),
            ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new SeedTrace.StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new SeedTrace.StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<SeedTrace.Scope>()
                    {
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
        new SeedTrace.TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new SeedTrace.DebugVariableValue(
                new SeedTrace.DebugVariableValue.IntegerValue(1)
            ),
            ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new SeedTrace.StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new SeedTrace.StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<SeedTrace.Scope>()
                    {
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
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

**request:** `IEnumerable<SeedTrace.TraceResponseV2>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedWorkspaceAsync</a>(submissionId, SeedTrace.StoreTracedWorkspaceRequest { ... })</code></summary>
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
    new SeedTrace.StoreTracedWorkspaceRequest
    {
        WorkspaceRunDetails = new SeedTrace.WorkspaceRunDetails
        {
            ExceptionV2 = new SeedTrace.ExceptionV2(
                new SeedTrace.ExceptionV2.Generic(
                    new SeedTrace.ExceptionInfo
                    {
                        ExceptionType = "exceptionType",
                        ExceptionMessage = "exceptionMessage",
                        ExceptionStacktrace = "exceptionStacktrace",
                    }
                )
            ),
            Exception = new SeedTrace.ExceptionInfo
            {
                ExceptionType = "exceptionType",
                ExceptionMessage = "exceptionMessage",
                ExceptionStacktrace = "exceptionStacktrace",
            },
            Stdout = "stdout",
        },
        TraceResponses = new List<SeedTrace.TraceResponse>()
        {
            new SeedTrace.TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new SeedTrace.DebugVariableValue(
                    new SeedTrace.DebugVariableValue.IntegerValue(1)
                ),
                ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new SeedTrace.StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new SeedTrace.StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<SeedTrace.Scope>()
                        {
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                        },
                    },
                },
                Stdout = "stdout",
            },
            new SeedTrace.TraceResponse
            {
                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                LineNumber = 1,
                ReturnValue = new SeedTrace.DebugVariableValue(
                    new SeedTrace.DebugVariableValue.IntegerValue(1)
                ),
                ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
                Stack = new SeedTrace.StackInformation
                {
                    NumStackFrames = 1,
                    TopStackFrame = new SeedTrace.StackFrame
                    {
                        MethodName = "methodName",
                        LineNumber = 1,
                        Scopes = new List<SeedTrace.Scope>()
                        {
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
                                        )
                                    },
                                },
                            },
                            new SeedTrace.Scope
                            {
                                Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                                {
                                    {
                                        "variables",
                                        new SeedTrace.DebugVariableValue(
                                            new SeedTrace.DebugVariableValue.IntegerValue(1)
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

**request:** `SeedTrace.StoreTracedWorkspaceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Admin.<a href="/src/SeedTrace/Admin/AdminClient.cs">StoreTracedWorkspaceV2Async</a>(submissionId, IEnumerable<SeedTrace.TraceResponseV2> { ... })</code></summary>
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
    new List<SeedTrace.TraceResponseV2>()
    {
        new SeedTrace.TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new SeedTrace.DebugVariableValue(
                new SeedTrace.DebugVariableValue.IntegerValue(1)
            ),
            ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new SeedTrace.StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new SeedTrace.StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<SeedTrace.Scope>()
                    {
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                    },
                },
            },
            Stdout = "stdout",
        },
        new SeedTrace.TraceResponseV2
        {
            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            LineNumber = 1,
            File = new SeedTrace.TracedFile { Filename = "filename", Directory = "directory" },
            ReturnValue = new SeedTrace.DebugVariableValue(
                new SeedTrace.DebugVariableValue.IntegerValue(1)
            ),
            ExpressionLocation = new SeedTrace.ExpressionLocation { Start = 1, Offset = 1 },
            Stack = new SeedTrace.StackInformation
            {
                NumStackFrames = 1,
                TopStackFrame = new SeedTrace.StackFrame
                {
                    MethodName = "methodName",
                    LineNumber = 1,
                    Scopes = new List<SeedTrace.Scope>()
                    {
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
                                },
                            },
                        },
                        new SeedTrace.Scope
                        {
                            Variables = new Dictionary<string, SeedTrace.DebugVariableValue>()
                            {
                                {
                                    "variables",
                                    new SeedTrace.DebugVariableValue(
                                        new SeedTrace.DebugVariableValue.IntegerValue(1)
                                    )
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

**request:** `IEnumerable<SeedTrace.TraceResponseV2>` 
    
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
<details><summary><code>client.Migration.<a href="/src/SeedTrace/Migration/MigrationClient.cs">GetAttemptedMigrationsAsync</a>(SeedTrace.GetAttemptedMigrationsRequest { ... }) -> IEnumerable<SeedTrace.Migration></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Migration.GetAttemptedMigrationsAsync(
    new SeedTrace.GetAttemptedMigrationsRequest { AdminKeyHeader = "admin-key-header" }
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

**request:** `SeedTrace.GetAttemptedMigrationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">CreatePlaylistAsync</a>(serviceParam, SeedTrace.CreatePlaylistRequest { ... }) -> SeedTrace.Playlist</code></summary>
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
    new SeedTrace.CreatePlaylistRequest
    {
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        OptionalDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Body = new SeedTrace.PlaylistCreateRequest
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

**request:** `SeedTrace.CreatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">GetPlaylistsAsync</a>(serviceParam, SeedTrace.GetPlaylistsRequest { ... }) -> IEnumerable<SeedTrace.Playlist></code></summary>
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
    new SeedTrace.GetPlaylistsRequest
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

**request:** `SeedTrace.GetPlaylistsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">GetPlaylistAsync</a>(serviceParam, playlistId) -> SeedTrace.Playlist</code></summary>
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

<details><summary><code>client.Playlist.<a href="/src/SeedTrace/Playlist/PlaylistClient.cs">UpdatePlaylistAsync</a>(serviceParam, playlistId, SeedTrace.UpdatePlaylistRequest? { ... }) -> SeedTrace.Playlist?</code></summary>
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
    new SeedTrace.UpdatePlaylistRequest
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

**request:** `SeedTrace.UpdatePlaylistRequest?` 
    
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
<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">CreateProblemAsync</a>(SeedTrace.CreateProblemRequest { ... }) -> SeedTrace.CreateProblemResponse</code></summary>
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
    new SeedTrace.CreateProblemRequest
    {
        ProblemName = "problemName",
        ProblemDescription = new SeedTrace.ProblemDescription
        {
            Boards = new List<SeedTrace.ProblemDescriptionBoard>()
            {
                new SeedTrace.ProblemDescriptionBoard(
                    new SeedTrace.ProblemDescriptionBoard.Html("boards")
                ),
                new SeedTrace.ProblemDescriptionBoard(
                    new SeedTrace.ProblemDescriptionBoard.Html("boards")
                ),
            },
        },
        Files = new Dictionary<SeedTrace.Language, SeedTrace.ProblemFiles>()
        {
            {
                SeedTrace.Language.Java,
                new SeedTrace.ProblemFiles
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
        InputParams = new List<SeedTrace.VariableTypeAndName>()
        {
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
        Testcases = new List<SeedTrace.TestCaseWithExpectedResult>()
        {
            new SeedTrace.TestCaseWithExpectedResult
            {
                TestCase = new SeedTrace.TestCase
                {
                    Id = "id",
                    Params = new List<SeedTrace.VariableValue>()
                    {
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new SeedTrace.VariableValue(
                    new SeedTrace.VariableValue.IntegerValue(1)
                ),
            },
            new SeedTrace.TestCaseWithExpectedResult
            {
                TestCase = new SeedTrace.TestCase
                {
                    Id = "id",
                    Params = new List<SeedTrace.VariableValue>()
                    {
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new SeedTrace.VariableValue(
                    new SeedTrace.VariableValue.IntegerValue(1)
                ),
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

**request:** `SeedTrace.CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">UpdateProblemAsync</a>(problemId, SeedTrace.CreateProblemRequest { ... }) -> SeedTrace.UpdateProblemResponse</code></summary>
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
    new SeedTrace.CreateProblemRequest
    {
        ProblemName = "problemName",
        ProblemDescription = new SeedTrace.ProblemDescription
        {
            Boards = new List<SeedTrace.ProblemDescriptionBoard>()
            {
                new SeedTrace.ProblemDescriptionBoard(
                    new SeedTrace.ProblemDescriptionBoard.Html("boards")
                ),
                new SeedTrace.ProblemDescriptionBoard(
                    new SeedTrace.ProblemDescriptionBoard.Html("boards")
                ),
            },
        },
        Files = new Dictionary<SeedTrace.Language, SeedTrace.ProblemFiles>()
        {
            {
                SeedTrace.Language.Java,
                new SeedTrace.ProblemFiles
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
        InputParams = new List<SeedTrace.VariableTypeAndName>()
        {
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
        Testcases = new List<SeedTrace.TestCaseWithExpectedResult>()
        {
            new SeedTrace.TestCaseWithExpectedResult
            {
                TestCase = new SeedTrace.TestCase
                {
                    Id = "id",
                    Params = new List<SeedTrace.VariableValue>()
                    {
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new SeedTrace.VariableValue(
                    new SeedTrace.VariableValue.IntegerValue(1)
                ),
            },
            new SeedTrace.TestCaseWithExpectedResult
            {
                TestCase = new SeedTrace.TestCase
                {
                    Id = "id",
                    Params = new List<SeedTrace.VariableValue>()
                    {
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                        new SeedTrace.VariableValue(new SeedTrace.VariableValue.IntegerValue(1)),
                    },
                },
                ExpectedResult = new SeedTrace.VariableValue(
                    new SeedTrace.VariableValue.IntegerValue(1)
                ),
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

**request:** `SeedTrace.CreateProblemRequest` 
    
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

<details><summary><code>client.Problem.<a href="/src/SeedTrace/Problem/ProblemClient.cs">GetDefaultStarterFilesAsync</a>(SeedTrace.GetDefaultStarterFilesRequest { ... }) -> SeedTrace.GetDefaultStarterFilesResponse</code></summary>
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
    new SeedTrace.GetDefaultStarterFilesRequest
    {
        InputParams = new List<SeedTrace.VariableTypeAndName>()
        {
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
            new SeedTrace.VariableTypeAndName
            {
                VariableType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
                Name = "name",
            },
        },
        OutputType = new SeedTrace.VariableType(new SeedTrace.VariableType.IntegerType()),
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

**request:** `SeedTrace.GetDefaultStarterFilesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">CreateExecutionSessionAsync</a>(language) -> SeedTrace.ExecutionSessionResponse</code></summary>
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
await client.Submission.CreateExecutionSessionAsync(SeedTrace.Language.Java);
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">GetExecutionSessionAsync</a>(sessionId) -> SeedTrace.ExecutionSessionResponse?</code></summary>
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

<details><summary><code>client.Submission.<a href="/src/SeedTrace/Submission/SubmissionClient.cs">GetExecutionSessionsStateAsync</a>() -> SeedTrace.GetExecutionSessionStateResponse</code></summary>
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
await client.Sysprop.SetNumWarmInstancesAsync(SeedTrace.Language.Java, 1);
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

**numWarmInstances:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Sysprop.<a href="/src/SeedTrace/Sysprop/SyspropClient.cs">GetNumWarmInstancesAsync</a>() -> Dictionary<SeedTrace.Language, int></code></summary>
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
<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetLightweightProblemsAsync</a>() -> IEnumerable<SeedTrace.V2.LightweightProblemInfoV2></code></summary>
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

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetProblemsAsync</a>() -> IEnumerable<SeedTrace.V2.ProblemInfoV2></code></summary>
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

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetLatestProblemAsync</a>(problemId) -> SeedTrace.V2.ProblemInfoV2</code></summary>
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

<details><summary><code>client.V2.Problem.<a href="/src/SeedTrace/V2/Problem/ProblemClient.cs">GetProblemVersionAsync</a>(problemId, problemVersion) -> SeedTrace.V2.ProblemInfoV2</code></summary>
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
<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetLightweightProblemsAsync</a>() -> IEnumerable<SeedTrace.V2.V3.LightweightProblemInfoV2></code></summary>
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

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetProblemsAsync</a>() -> IEnumerable<SeedTrace.V2.V3.ProblemInfoV2></code></summary>
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

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetLatestProblemAsync</a>(problemId) -> SeedTrace.V2.V3.ProblemInfoV2</code></summary>
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

<details><summary><code>client.V2.V3.Problem.<a href="/src/SeedTrace/V2/V3/Problem/ProblemClient.cs">GetProblemVersionAsync</a>(problemId, problemVersion) -> SeedTrace.V2.V3.ProblemInfoV2</code></summary>
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
