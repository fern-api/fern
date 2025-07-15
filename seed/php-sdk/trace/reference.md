# Reference
## V2
<details><summary><code>$client->v2->test(?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->v2->test(?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>$client->admin->updateTestSubmissionStatus(string $submissionId, TestSubmissionStatus $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateTestSubmissionStatus(string $submissionId, TestSubmissionStatus $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->sendTestSubmissionUpdate(string $submissionId, TestSubmissionUpdate $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendTestSubmissionUpdate(string $submissionId, TestSubmissionUpdate $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->updateWorkspaceSubmissionStatus(string $submissionId, WorkspaceSubmissionStatus $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->updateWorkspaceSubmissionStatus(string $submissionId, WorkspaceSubmissionStatus $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->sendWorkspaceSubmissionUpdate(string $submissionId, WorkspaceSubmissionUpdate $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->sendWorkspaceSubmissionUpdate(string $submissionId, WorkspaceSubmissionUpdate $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedTestCase(string $submissionId, string $testCaseId, StoreTracedTestCaseRequest $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCase(string $submissionId, string $testCaseId, StoreTracedTestCaseRequest $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedTestCaseV2(string $submissionId, string $testCaseId, array $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedTestCaseV2(string $submissionId, string $testCaseId, array $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedWorkspace(string $submissionId, StoreTracedWorkspaceRequest $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspace(string $submissionId, StoreTracedWorkspaceRequest $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->admin->storeTracedWorkspaceV2(string $submissionId, array $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->admin->storeTracedWorkspaceV2(string $submissionId, array $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>$client->homepage->getHomepageProblems(?array $options): array;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->getHomepageProblems(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->homepage->setHomepageProblems(array $request, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->homepage->setHomepageProblems(array $request, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>$client->migration->getAttemptedMigrations(GetAttemptedMigrationsRequest $request, ?array $options): array;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->migration->getAttemptedMigrations(GetAttemptedMigrationsRequest $request, ?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>$client->playlist->createPlaylist(int $serviceParam, CreatePlaylistRequest $request, ?array $options): Playlist;</code></summary>
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
$client->playlist->createPlaylist(int $serviceParam, CreatePlaylistRequest $request, ?array $options): Playlist;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->getPlaylists(int $serviceParam, GetPlaylistsRequest $request, ?array $options): array;</code></summary>
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
$client->playlist->getPlaylists(int $serviceParam, GetPlaylistsRequest $request, ?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->getPlaylist(int $serviceParam, string $playlistId, ?array $options): Playlist;</code></summary>
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
$client->playlist->getPlaylist(int $serviceParam, string $playlistId, ?array $options): Playlist;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->updatePlaylist(int $serviceParam, string $playlistId, ?UpdatePlaylistRequest $request, ?array $options): ?Playlist;</code></summary>
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
$client->playlist->updatePlaylist(int $serviceParam, string $playlistId, ?UpdatePlaylistRequest $request, ?array $options): ?Playlist;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->playlist->deletePlaylist(int $serviceParam, string $playlistId, ?array $options): void;</code></summary>
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
$client->playlist->deletePlaylist(int $serviceParam, string $playlistId, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>$client->problem->createProblem(CreateProblemRequest $request, ?array $options): CreateProblemResponse;</code></summary>
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
$client->problem->createProblem(CreateProblemRequest $request, ?array $options): CreateProblemResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->updateProblem(string $problemId, CreateProblemRequest $request, ?array $options): UpdateProblemResponse;</code></summary>
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
$client->problem->updateProblem(string $problemId, CreateProblemRequest $request, ?array $options): UpdateProblemResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->deleteProblem(string $problemId, ?array $options): void;</code></summary>
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
$client->problem->deleteProblem(string $problemId, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->problem->getDefaultStarterFiles(GetDefaultStarterFilesRequest $request, ?array $options): GetDefaultStarterFilesResponse;</code></summary>
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
$client->problem->getDefaultStarterFiles(GetDefaultStarterFilesRequest $request, ?array $options): GetDefaultStarterFilesResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>$client->submission->createExecutionSession(string $language, ?array $options): ExecutionSessionResponse;</code></summary>
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
$client->submission->createExecutionSession(string $language, ?array $options): ExecutionSessionResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->getExecutionSession(string $sessionId, ?array $options): ?ExecutionSessionResponse;</code></summary>
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
$client->submission->getExecutionSession(string $sessionId, ?array $options): ?ExecutionSessionResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->stopExecutionSession(string $sessionId, ?array $options): void;</code></summary>
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
$client->submission->stopExecutionSession(string $sessionId, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->submission->getExecutionSessionsState(?array $options): GetExecutionSessionStateResponse;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->submission->getExecutionSessionsState(?array $options): GetExecutionSessionStateResponse;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>$client->sysprop->setNumWarmInstances(string $language, int $numWarmInstances, ?array $options): void;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->setNumWarmInstances(string $language, int $numWarmInstances, ?array $options): void;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->sysprop->getNumWarmInstances(?array $options): array;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->sysprop->getNumWarmInstances(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 Problem
<details><summary><code>$client->v2->problem->getLightweightProblems(?array $options): array;</code></summary>
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
$client->v2->problem->getLightweightProblems(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getProblems(?array $options): array;</code></summary>
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
$client->v2->problem->getProblems(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getLatestProblem(string $problemId, ?array $options): ProblemInfoV2;</code></summary>
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
$client->v2->problem->getLatestProblem(string $problemId, ?array $options): ProblemInfoV2;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->problem->getProblemVersion(string $problemId, int $problemVersion, ?array $options): ProblemInfoV2;</code></summary>
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
$client->v2->problem->getProblemVersion(string $problemId, int $problemVersion, ?array $options): ProblemInfoV2;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2 V3 Problem
<details><summary><code>$client->v2->v3->problem->getLightweightProblems(?array $options): array;</code></summary>
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
$client->v2->v3->problem->getLightweightProblems(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getProblems(?array $options): array;</code></summary>
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
$client->v2->v3->problem->getProblems(?array $options): array;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getLatestProblem(string $problemId, ?array $options): ProblemInfoV2;</code></summary>
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
$client->v2->v3->problem->getLatestProblem(string $problemId, ?array $options): ProblemInfoV2;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->v2->v3->problem->getProblemVersion(string $problemId, int $problemVersion, ?array $options): ProblemInfoV2;</code></summary>
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
$client->v2->v3->problem->getProblemVersion(string $problemId, int $problemVersion, ?array $options): ProblemInfoV2;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
