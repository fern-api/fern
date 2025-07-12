# Reference
## V2
<details><summary><code>$client-><a href="/Seed/V2/ClientClient.php">test</a>()</code></summary>
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
<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">updateTestSubmissionStatus</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateTestSubmissionStatus(
    submissionId: $submissionId,
    $request,
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

**$request:** `\Seed\Submission\Types\TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">sendTestSubmissionUpdate</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendTestSubmissionUpdate(
    submissionId: $submissionId,
    $request,
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

**$request:** `\Seed\Submission\Types\TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">updateWorkspaceSubmissionStatus</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateWorkspaceSubmissionStatus(
    submissionId: $submissionId,
    $request,
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

**$request:** `\Seed\Submission\Types\WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">sendWorkspaceSubmissionUpdate</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendWorkspaceSubmissionUpdate(
    submissionId: $submissionId,
    $request,
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

**$request:** `\Seed\Submission\Types\WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">storeTracedTestCase</a>($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCase(
    submissionId: $submissionId,
    testCaseId: $testCaseId,
    $request,
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

**$request:** `\Seed\Admin\Requests\StoreTracedTestCaseRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">storeTracedTestCaseV2</a>($submissionId, $testCaseId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCaseV2(
    submissionId: $submissionId,
    testCaseId: $testCaseId,
    $request,
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

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">storeTracedWorkspace</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspace(
    submissionId: $submissionId,
    $request,
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

**$request:** `\Seed\Admin\Requests\StoreTracedWorkspaceRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Admin/AdminClient.php">storeTracedWorkspaceV2</a>($submissionId, $request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspaceV2(
    submissionId: $submissionId,
    $request,
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
<details><summary><code>$client-><a href="/Seed/Homepage/HomepageClient.php">getHomepageProblems</a>() -> array</code></summary>
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

<details><summary><code>$client-><a href="/Seed/Homepage/HomepageClient.php">setHomepageProblems</a>($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->setHomepageProblems(
    $request,
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
<details><summary><code>$client-><a href="/Seed/Migration/MigrationClient.php">getAttemptedMigrations</a>($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->migration->getAttemptedMigrations(
    $request,
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

**$request:** `\Seed\Migration\Requests\GetAttemptedMigrationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>$client-><a href="/Seed/Playlist/PlaylistClient.php">createPlaylist</a>($serviceParam, $request) -> \Seed\Playlist\Types\Playlist</code></summary>
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
    serviceParam: $serviceParam,
    $request,
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

**$request:** `\Seed\Playlist\Requests\CreatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Playlist/PlaylistClient.php">getPlaylists</a>($serviceParam, $request) -> array</code></summary>
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
    serviceParam: $serviceParam,
    $request,
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

**$request:** `\Seed\Playlist\Requests\GetPlaylistsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Playlist/PlaylistClient.php">getPlaylist</a>($serviceParam, $playlistId) -> \Seed\Playlist\Types\Playlist</code></summary>
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
    serviceParam: $serviceParam,
    playlistId: $playlistId,
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

<details><summary><code>$client-><a href="/Seed/Playlist/PlaylistClient.php">updatePlaylist</a>($serviceParam, $playlistId, $request) -> ?\Seed\Playlist\Types\Playlist</code></summary>
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
    serviceParam: $serviceParam,
    playlistId: $playlistId,
    $request,
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

**$request:** `?\Seed\Playlist\Types\UpdatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Playlist/PlaylistClient.php">deletePlaylist</a>($serviceParam, $playlistId)</code></summary>
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
    serviceParam: $serviceParam,
    playlistId: $playlistId,
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
<details><summary><code>$client-><a href="/Seed/Problem/ProblemClient.php">createProblem</a>($request) -> \Seed\Problem\Types\CreateProblemResponse</code></summary>
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
    $request,
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

**$request:** `\Seed\Problem\Types\CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Problem/ProblemClient.php">updateProblem</a>($problemId, $request) -> \Seed\Problem\Types\UpdateProblemResponse</code></summary>
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
    problemId: $problemId,
    $request,
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

**$request:** `\Seed\Problem\Types\CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Problem/ProblemClient.php">deleteProblem</a>($problemId)</code></summary>
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
    problemId: $problemId,
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

<details><summary><code>$client-><a href="/Seed/Problem/ProblemClient.php">getDefaultStarterFiles</a>($request) -> \Seed\Problem\Types\GetDefaultStarterFilesResponse</code></summary>
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
    $request,
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

**$request:** `\Seed\Problem\Requests\GetDefaultStarterFilesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>$client-><a href="/Seed/Submission/SubmissionClient.php">createExecutionSession</a>($language) -> \Seed\Submission\Types\ExecutionSessionResponse</code></summary>
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
    language: $language,
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

**$language:** `enumString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/Submission/SubmissionClient.php">getExecutionSession</a>($sessionId) -> ?\Seed\Submission\Types\ExecutionSessionResponse</code></summary>
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
    sessionId: $sessionId,
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

<details><summary><code>$client-><a href="/Seed/Submission/SubmissionClient.php">stopExecutionSession</a>($sessionId)</code></summary>
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
    sessionId: $sessionId,
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

<details><summary><code>$client-><a href="/Seed/Submission/SubmissionClient.php">getExecutionSessionsState</a>() -> \Seed\Submission\Types\GetExecutionSessionStateResponse</code></summary>
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
<details><summary><code>$client-><a href="/Seed/Sysprop/SyspropClient.php">setNumWarmInstances</a>($language, $numWarmInstances)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->setNumWarmInstances(
    language: $language,
    numWarmInstances: $numWarmInstances,
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

**$language:** `enumString` 
    
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

<details><summary><code>$client-><a href="/Seed/Sysprop/SyspropClient.php">getNumWarmInstances</a>() -> array</code></summary>
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
<details><summary><code>$client-><a href="/Seed/V2/Problem/ProblemClient.php">getLightweightProblems</a>() -> array</code></summary>
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

<details><summary><code>$client-><a href="/Seed/V2/Problem/ProblemClient.php">getProblems</a>() -> array</code></summary>
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

<details><summary><code>$client-><a href="/Seed/V2/Problem/ProblemClient.php">getLatestProblem</a>($problemId) -> \Seed\V2\Problem\Types\ProblemInfoV2</code></summary>
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
    problemId: $problemId,
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

<details><summary><code>$client-><a href="/Seed/V2/Problem/ProblemClient.php">getProblemVersion</a>($problemId, $problemVersion) -> \Seed\V2\Problem\Types\ProblemInfoV2</code></summary>
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
    problemId: $problemId,
    problemVersion: $problemVersion,
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
<details><summary><code>$client-><a href="/Seed/V2/V3/Problem/ProblemClient.php">getLightweightProblems</a>() -> array</code></summary>
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
$client->v2->v3->problem->getLightweightProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/V2/V3/Problem/ProblemClient.php">getProblems</a>() -> array</code></summary>
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
$client->v2->v3->problem->getProblems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Seed/V2/V3/Problem/ProblemClient.php">getLatestProblem</a>($problemId) -> \Seed\V2\V3\Problem\Types\ProblemInfoV2</code></summary>
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
$client->v2->v3->problem->getLatestProblem(
    problemId: $problemId,
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

<details><summary><code>$client-><a href="/Seed/V2/V3/Problem/ProblemClient.php">getProblemVersion</a>($problemId, $problemVersion) -> \Seed\V2\V3\Problem\Types\ProblemInfoV2</code></summary>
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
$client->v2->v3->problem->getProblemVersion(
    problemId: $problemId,
    problemVersion: $problemVersion,
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
