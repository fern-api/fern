# Reference
## V2
<details><summary><code>$client-&gt;v2-&gt;test()</code></summary>
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
<details><summary><code>$client-&gt;admin-&gt;updatetestsubmissionstatus($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updatetestsubmissionstatus(
    'submissionId',
    new AdminUpdateTestSubmissionStatusRequest([
        'body' => TestSubmissionStatus::stopped(new TestSubmissionStatusStopped([])),
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

**$request:** `TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;admin-&gt;sendtestsubmissionupdate($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendtestsubmissionupdate(
    'submissionId',
    new AdminSendTestSubmissionUpdateRequest([
        'body' => new TestSubmissionUpdate([
            'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
            'updateInfo' => new TestSubmissionUpdateInfoZero([
                'type' => TestSubmissionUpdateInfoZeroType::Running->value,
            ]),
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

<details><summary><code>$client-&gt;admin-&gt;updateworkspacesubmissionstatus($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateworkspacesubmissionstatus(
    'submissionId',
    new AdminUpdateWorkspaceSubmissionStatusRequest([
        'body' => new WorkspaceSubmissionStatusZero([
            'type' => WorkspaceSubmissionStatusZeroType::Stopped->value,
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

**$submissionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `WorkspaceSubmissionStatusZero|WorkspaceSubmissionStatusOne|WorkspaceSubmissionStatusType|WorkspaceSubmissionStatusThree|WorkspaceSubmissionStatusFour` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;admin-&gt;sendworkspacesubmissionupdate($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendworkspacesubmissionupdate(
    'submissionId',
    new AdminSendWorkspaceSubmissionUpdateRequest([
        'body' => new WorkspaceSubmissionUpdate([
            'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
            'updateInfo' => new WorkspaceSubmissionUpdateInfoZero([
                'type' => WorkspaceSubmissionUpdateInfoZeroType::Running->value,
            ]),
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

<details><summary><code>$client-&gt;admin-&gt;storetracedtestcase($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storetracedtestcase(
    'submissionId',
    'testCaseId',
    new AdminStoreTracedTestCaseRequest([
        'result' => new TestCaseResultWithStdout([
            'result' => new TestCaseResult([
                'expectedResult' => new VariableValueZero([
                    'type' => VariableValueZeroType::IntegerValue->value,
                ]),
                'actualResult' => new ActualResultZero([
                    'type' => ActualResultZeroType::Value->value,
                ]),
                'passed' => true,
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
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

<details><summary><code>$client-&gt;admin-&gt;storetracedtestcasev2($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storetracedtestcasev2(
    'submissionId',
    'testCaseId',
    new AdminStoreTracedTestCaseV2Request([
        'body' => [
            new TraceResponseV2([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'file' => new TracedFile([
                    'filename' => 'filename',
                    'directory' => 'directory',
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;admin-&gt;storetracedworkspace($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storetracedworkspace(
    'submissionId',
    new AdminStoreTracedWorkspaceRequest([
        'workspaceRunDetails' => new WorkspaceRunDetails([
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
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

<details><summary><code>$client-&gt;admin-&gt;storetracedworkspacev2($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storetracedworkspacev2(
    'submissionId',
    new AdminStoreTracedWorkspaceV2Request([
        'body' => [
            new TraceResponseV2([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'file' => new TracedFile([
                    'filename' => 'filename',
                    'directory' => 'directory',
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>$client-&gt;homepage-&gt;gethomepageproblems() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->gethomepageproblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;homepage-&gt;sethomepageproblems($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->sethomepageproblems(
    [
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
<details><summary><code>$client-&gt;migration-&gt;getattemptedmigrations($request) -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->migration->getattemptedmigrations(
    new MigrationGetAttemptedMigrationsRequest([
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
<details><summary><code>$client-&gt;playlist-&gt;createplaylist($serviceParam, $request) -> ?Playlist</code></summary>
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
$client->playlist->createplaylist(
    1,
    new PlaylistCreatePlaylistRequest([
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'body' => new PlaylistCreateRequest([
            'name' => 'name',
            'problems' => [
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

<details><summary><code>$client-&gt;playlist-&gt;getplaylists($serviceParam, $request) -> ?array</code></summary>
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
$client->playlist->getplaylists(
    1,
    new PlaylistGetPlaylistsRequest([
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

**$multipleField:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;playlist-&gt;getplaylist($serviceParam, $playlistId) -> ?Playlist</code></summary>
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
$client->playlist->getplaylist(
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

<details><summary><code>$client-&gt;playlist-&gt;updateplaylist($serviceParam, $playlistId, $request) -> ?Playlist</code></summary>
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
$client->playlist->updateplaylist(
    1,
    'playlistId',
    new UpdatePlaylistRequest([
        'name' => 'name',
        'problems' => [
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

**$name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$problems:** `array` — The problems that make up the playlist.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;playlist-&gt;deleteplaylist($serviceParam, $playlistId)</code></summary>
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
$client->playlist->deleteplaylist(
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
<details><summary><code>$client-&gt;problem-&gt;createproblem($request) -> ?CreateProblemResponse</code></summary>
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
$client->problem->createproblem(
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [
                ProblemDescriptionBoard::html(new ProblemDescriptionBoardHtml([])),
            ],
        ]),
        'files' => [
            'key' => new ProblemFiles([
                'solutionFile' => new FileInfo([
                    'filename' => 'filename',
                    'contents' => 'contents',
                ]),
                'readOnlyFiles' => [
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                ],
            ]),
        ],
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => new VariableTypeZero([
                    'type' => VariableTypeZeroType::IntegerType->value,
                ]),
                'name' => 'name',
            ]),
        ],
        'outputType' => new VariableTypeZero([
            'type' => VariableTypeZeroType::IntegerType->value,
        ]),
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        new VariableValueZero([
                            'type' => VariableValueZeroType::IntegerValue->value,
                        ]),
                    ],
                ]),
                'expectedResult' => new VariableValueZero([
                    'type' => VariableValueZeroType::IntegerValue->value,
                ]),
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

<details><summary><code>$client-&gt;problem-&gt;updateproblem($problemId, $request) -> ?UpdateProblemResponse</code></summary>
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
$client->problem->updateproblem(
    'problemId',
    new ProblemUpdateProblemRequest([
        'body' => new CreateProblemRequest([
            'problemName' => 'problemName',
            'problemDescription' => new ProblemDescription([
                'boards' => [
                    ProblemDescriptionBoard::html(new ProblemDescriptionBoardHtml([])),
                ],
            ]),
            'files' => [
                'key' => new ProblemFiles([
                    'solutionFile' => new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                    'readOnlyFiles' => [
                        new FileInfo([
                            'filename' => 'filename',
                            'contents' => 'contents',
                        ]),
                    ],
                ]),
            ],
            'inputParams' => [
                new VariableTypeAndName([
                    'variableType' => new VariableTypeZero([
                        'type' => VariableTypeZeroType::IntegerType->value,
                    ]),
                    'name' => 'name',
                ]),
            ],
            'outputType' => new VariableTypeZero([
                'type' => VariableTypeZeroType::IntegerType->value,
            ]),
            'testcases' => [
                new TestCaseWithExpectedResult([
                    'testCase' => new TestCase([
                        'id' => 'id',
                        'params' => [
                            new VariableValueZero([
                                'type' => VariableValueZeroType::IntegerValue->value,
                            ]),
                        ],
                    ]),
                    'expectedResult' => new VariableValueZero([
                        'type' => VariableValueZeroType::IntegerValue->value,
                    ]),
                ]),
            ],
            'methodName' => 'methodName',
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

<details><summary><code>$client-&gt;problem-&gt;deleteproblem($problemId)</code></summary>
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
$client->problem->deleteproblem(
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

<details><summary><code>$client-&gt;problem-&gt;getdefaultstarterfiles($request) -> ?GetDefaultStarterFilesResponse</code></summary>
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
$client->problem->getdefaultstarterfiles(
    new ProblemGetDefaultStarterFilesRequest([
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => new VariableTypeZero([
                    'type' => VariableTypeZeroType::IntegerType->value,
                ]),
                'name' => 'name',
            ]),
        ],
        'outputType' => new VariableTypeZero([
            'type' => VariableTypeZeroType::IntegerType->value,
        ]),
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

**$outputType:** `VariableTypeZero|VariableTypeOne|VariableTypeTwo|VariableTypeThree|VariableTypeFour|VariableTypeFive|VariableTypeSix|VariableTypeSeven|VariableTypeEight|VariableTypeNine` 
    
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
<details><summary><code>$client-&gt;submission-&gt;createexecutionsession($language) -> ?ExecutionSessionResponse</code></summary>
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
$client->submission->createexecutionsession(
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

<details><summary><code>$client-&gt;submission-&gt;getexecutionsession($sessionId) -> ?ExecutionSessionResponse</code></summary>
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
$client->submission->getexecutionsession(
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

<details><summary><code>$client-&gt;submission-&gt;stopexecutionsession($sessionId)</code></summary>
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
$client->submission->stopexecutionsession(
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

<details><summary><code>$client-&gt;submission-&gt;getexecutionsessionsstate() -> ?GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->submission->getexecutionsessionsstate();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>$client-&gt;sysprop-&gt;setnumwarminstances($language, $numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->setnumwarminstances(
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

<details><summary><code>$client-&gt;sysprop-&gt;getnumwarminstances() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->getnumwarminstances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2Problem
<details><summary><code>$client-&gt;v2Problem-&gt;v2ProblemGetLightweightProblems() -> ?array</code></summary>
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
$client->v2Problem->v2ProblemGetLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;v2Problem-&gt;v2ProblemGetProblems() -> ?array</code></summary>
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
$client->v2Problem->v2ProblemGetProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;v2Problem-&gt;v2ProblemGetLatestProblem($problemId) -> ?V2ProblemInfoV2</code></summary>
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
$client->v2Problem->v2ProblemGetLatestProblem(
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

<details><summary><code>$client-&gt;v2Problem-&gt;v2ProblemGetProblemVersion($problemId, $problemVersion) -> ?V2ProblemInfoV2</code></summary>
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
$client->v2Problem->v2ProblemGetProblemVersion(
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

## V2V3Problem
<details><summary><code>$client-&gt;v2V3Problem-&gt;v2V3ProblemGetLightweightProblems() -> ?array</code></summary>
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
$client->v2V3Problem->v2V3ProblemGetLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;v2V3Problem-&gt;v2V3ProblemGetProblems() -> ?array</code></summary>
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
$client->v2V3Problem->v2V3ProblemGetProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;v2V3Problem-&gt;v2V3ProblemGetLatestProblem($problemId) -> ?V2V3ProblemInfoV2</code></summary>
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
$client->v2V3Problem->v2V3ProblemGetLatestProblem(
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

<details><summary><code>$client-&gt;v2V3Problem-&gt;v2V3ProblemGetProblemVersion($problemId, $problemVersion) -> ?V2V3ProblemInfoV2</code></summary>
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
$client->v2V3Problem->v2V3ProblemGetProblemVersion(
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

