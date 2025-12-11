# Reference
## V2
<details><summary><code>$client->v2->test()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->v2->test();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>$client->admin->updateTestSubmissionStatus($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateTestSubmissionStatus(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    TestSubmissionStatus::stopped(),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->sendTestSubmissionUpdate($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendTestSubmissionUpdate(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    new TestSubmissionUpdate([
        'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
        'updateInfo' => TestSubmissionUpdateInfo::running(),
    ]),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->updateWorkspaceSubmissionStatus($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateWorkspaceSubmissionStatus(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    WorkspaceSubmissionStatus::stopped(),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->sendWorkspaceSubmissionUpdate($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendWorkspaceSubmissionUpdate(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    new WorkspaceSubmissionUpdate([
        'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
        'updateInfo' => WorkspaceSubmissionUpdateInfo::running(),
    ]),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedTestCase($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCase(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    'testCaseId',
    new StoreTracedTestCaseRequest([
        'result' => new TestCaseResultWithStdout([
            'result' => new TestCaseResult([
                'expectedResult' => VariableValue::integerValue(),
                'actualResult' => ActualResult::value(),
                'passed' => true,
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
        ],
    ]),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$testCaseId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$result:** `TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**$traceResponses:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedTestCaseV2($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCaseV2(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    'testCaseId',
    [
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
            'returnValue' => DebugVariableValue::integerValue(),
            'expressionLocation' => new ExpressionLocation([
                'start' => 1,
                'offset' => 1,
            ]),
            'stack' => new StackInformation([
                'numStackFrames' => 1,
                'topStackFrame' => new StackFrame([
                    'methodName' => 'methodName',
                    'lineNumber' => 1,
                    'scopes' => [
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                    ],
                ]),
            ]),
            'stdout' => 'stdout',
        ]),
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
            'returnValue' => DebugVariableValue::integerValue(),
            'expressionLocation' => new ExpressionLocation([
                'start' => 1,
                'offset' => 1,
            ]),
            'stack' => new StackInformation([
                'numStackFrames' => 1,
                'topStackFrame' => new StackFrame([
                    'methodName' => 'methodName',
                    'lineNumber' => 1,
                    'scopes' => [
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                    ],
                ]),
            ]),
            'stdout' => 'stdout',
        ]),
    ],
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$testCaseId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedWorkspace($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspace(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    new StoreTracedWorkspaceRequest([
        'workspaceRunDetails' => new WorkspaceRunDetails([
            'exceptionV2' => ExceptionV2::generic(new ExceptionInfo([
                'exceptionType' => 'exceptionType',
                'exceptionMessage' => 'exceptionMessage',
                'exceptionStacktrace' => 'exceptionStacktrace',
            ])),
            'exception' => new ExceptionInfo([
                'exceptionType' => 'exceptionType',
                'exceptionMessage' => 'exceptionMessage',
                'exceptionStacktrace' => 'exceptionStacktrace',
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
        ],
    ]),
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$workspaceRunDetails:** `WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**$traceResponses:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedWorkspaceV2($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspaceV2(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    [
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
            'returnValue' => DebugVariableValue::integerValue(),
            'expressionLocation' => new ExpressionLocation([
                'start' => 1,
                'offset' => 1,
            ]),
            'stack' => new StackInformation([
                'numStackFrames' => 1,
                'topStackFrame' => new StackFrame([
                    'methodName' => 'methodName',
                    'lineNumber' => 1,
                    'scopes' => [
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                    ],
                ]),
            ]),
            'stdout' => 'stdout',
        ]),
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
            'returnValue' => DebugVariableValue::integerValue(),
            'expressionLocation' => new ExpressionLocation([
                'start' => 1,
                'offset' => 1,
            ]),
            'stack' => new StackInformation([
                'numStackFrames' => 1,
                'topStackFrame' => new StackFrame([
                    'methodName' => 'methodName',
                    'lineNumber' => 1,
                    'scopes' => [
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                        new Scope([
                            'variables' => [
                                'variables' => DebugVariableValue::integerValue(),
                            ],
                        ]),
                    ],
                ]),
            ]),
            'stdout' => 'stdout',
        ]),
    ],
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>$client->homepage->getHomepageProblems() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->getHomepageProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->homepage->setHomepageProblems($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->setHomepageProblems(
    [
        'string',
        'string',
    ],
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>$client->migration->getAttemptedMigrations($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->migration->getAttemptedMigrations(
    new GetAttemptedMigrationsRequest([
        'adminKeyHeader' => 'admin-key-header',
    ]),
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

**$adminKeyHeader:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>$client->playlist->createPlaylist($serviceParam, $request) -> Playlist</code></summary>
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

```php
$client->playlist->createPlaylist(
    1,
    new CreatePlaylistRequest([
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'optionalDatetime' => new DateTime('2024-01-15T09:30:00Z'),
        'body' => new PlaylistCreateRequest([
            'name' => 'name',
            'problems' => [
                'problems',
                'problems',
            ],
        ]),
    ]),
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

**$serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$datetime:** `DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalDatetime:** `?DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `PlaylistCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->getPlaylists($serviceParam, $request) -> array</code></summary>
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

```php
$client->playlist->getPlaylists(
    1,
    new GetPlaylistsRequest([
        'limit' => 1,
        'otherField' => 'otherField',
        'multiLineDocs' => 'multiLineDocs',
        'optionalMultipleField' => [
            'optionalMultipleField',
        ],
        'multipleField' => [
            'multipleField',
        ],
    ]),
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

**$serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$otherField:** `string` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**$multiLineDocs:** `string` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**$optionalMultipleField:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$multipleField:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->getPlaylist($serviceParam, $playlistId) -> Playlist</code></summary>
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

```php
$client->playlist->getPlaylist(
    1,
    'playlistId',
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

**$serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$playlistId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->updatePlaylist($serviceParam, $playlistId, $request) -> ?Playlist</code></summary>
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

```php
$client->playlist->updatePlaylist(
    1,
    'playlistId',
    new UpdatePlaylistRequest([
        'name' => 'name',
        'problems' => [
            'problems',
            'problems',
        ],
    ]),
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

**$serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$playlistId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `?UpdatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->deletePlaylist($serviceParam, $playlistId)</code></summary>
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

```php
$client->playlist->deletePlaylist(
    1,
    'playlist_id',
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

**$serviceParam:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$playlistId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>$client->problem->createProblem($request) -> CreateProblemResponse</code></summary>
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

```php
$client->problem->createProblem(
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [
                ProblemDescriptionBoard::html(),
                ProblemDescriptionBoard::html(),
            ],
        ]),
        'files' => [
            Language::Java->value => new ProblemFiles([
                'solutionFile' => new FileInfo([
                    'filename' => 'filename',
                    'contents' => 'contents',
                ]),
                'readOnlyFiles' => [
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                ],
            ]),
        ],
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
        ],
        'outputType' => VariableType::integerType(),
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
        ],
        'methodName' => 'methodName',
    ]),
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

**$request:** `CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->updateProblem($problemId, $request) -> UpdateProblemResponse</code></summary>
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

```php
$client->problem->updateProblem(
    'problemId',
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [
                ProblemDescriptionBoard::html(),
                ProblemDescriptionBoard::html(),
            ],
        ]),
        'files' => [
            Language::Java->value => new ProblemFiles([
                'solutionFile' => new FileInfo([
                    'filename' => 'filename',
                    'contents' => 'contents',
                ]),
                'readOnlyFiles' => [
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                ],
            ]),
        ],
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
        ],
        'outputType' => VariableType::integerType(),
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
        ],
        'methodName' => 'methodName',
    ]),
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

**$problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->deleteProblem($problemId)</code></summary>
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

```php
$client->problem->deleteProblem(
    'problemId',
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

**$problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->getDefaultStarterFiles($request) -> GetDefaultStarterFilesResponse</code></summary>
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

```php
$client->problem->getDefaultStarterFiles(
    new GetDefaultStarterFilesRequest([
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
        ],
        'outputType' => VariableType::integerType(),
        'methodName' => 'methodName',
    ]),
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

**$inputParams:** `array` 
    
</dd>
</dl>

<dl>
<dd>

**$outputType:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**$methodName:** `string` 

The name of the `method` that the student has to complete.
The method name cannot include the following characters:
  - Greater Than `>`
  - Less Than `<``
  - Equals `=`
  - Period `.`
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>$client->submission->createExecutionSession($language) -> ExecutionSessionResponse</code></summary>
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

```php
$client->submission->createExecutionSession(
    Language::Java->value,
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

**$language:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->getExecutionSession($sessionId) -> ?ExecutionSessionResponse</code></summary>
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

```php
$client->submission->getExecutionSession(
    'sessionId',
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

**$sessionId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->stopExecutionSession($sessionId)</code></summary>
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

```php
$client->submission->stopExecutionSession(
    'sessionId',
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

**$sessionId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->getExecutionSessionsState() -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->submission->getExecutionSessionsState();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>$client->sysprop->setNumWarmInstances($language, $numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->setNumWarmInstances(
    Language::Java->value,
    1,
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

**$language:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$numWarmInstances:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->sysprop->getNumWarmInstances() -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->getNumWarmInstances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>$client->v2->problem->getLightweightProblems() -> array</code></summary>
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

```php
$client->v2->problem->getLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getProblems() -> array</code></summary>
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

```php
$client->v2->problem->getProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getLatestProblem($problemId) -> ProblemInfoV2</code></summary>
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

```php
$client->v2->problem->getLatestProblem(
    'problemId',
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

**$problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getProblemVersion($problemId, $problemVersion) -> ProblemInfoV2</code></summary>
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

```php
$client->v2->problem->getProblemVersion(
    'problemId',
    1,
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

**$problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>$client->v2->v3->problem->getLightweightProblems() -> array</code></summary>
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

```php
$client->v2->problem->getLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getProblems() -> array</code></summary>
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

```php
$client->v2->problem->getProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getLatestProblem($problemId) -> ProblemInfoV2</code></summary>
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

```php
$client->v2->problem->getLatestProblem(
    'problemId',
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

**$problemId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getProblemVersion($problemId, $problemVersion) -> ProblemInfoV2</code></summary>
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

```php
$client->v2->problem->getProblemVersion(
    'problemId',
    1,
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

**$problemId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$problemVersion:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
