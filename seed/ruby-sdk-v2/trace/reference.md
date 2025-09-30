# Reference
## v_2
<details><summary><code>client.v_2.test() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.v_2.test();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## admin
<details><summary><code>client.admin.update_test_submission_status(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_test_submission_status();
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::TestSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.send_test_submission_update(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_test_submission_update({
  updateTime:'2024-01-15T09:30:00Z'
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::TestSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.update_workspace_submission_status(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.update_workspace_submission_status();
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::WorkspaceSubmissionStatus` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.send_workspace_submission_update(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.send_workspace_submission_update({
  updateTime:'2024-01-15T09:30:00Z'
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Submission::Types::WorkspaceSubmissionUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_test_case(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_test_case({
  submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  testCaseId:'testCaseId',
  result:{
    result:{
      passed:true
    },
    stdout:'stdout'
  },
  traceResponses:[{
    submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber:1,
    expressionLocation:{
      start:1,
      offset:1
    },
    stack:{
      numStackFrames:1,
      topStackFrame:{
        methodName:'methodName',
        lineNumber:1,
        scopes:[{
          variables:{}
        }, {
          variables:{}
        }]
      }
    },
    stdout:'stdout'
  }, {
    submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber:1,
    expressionLocation:{
      start:1,
      offset:1
    },
    stack:{
      numStackFrames:1,
      topStackFrame:{
        methodName:'methodName',
        lineNumber:1,
        scopes:[{
          variables:{}
        }, {
          variables:{}
        }]
      }
    },
    stdout:'stdout'
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**result:** `Seed::Submission::Types::TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `Internal::Types::Array[Seed::Submission::Types::TraceResponse]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_test_case_v_2(submission_id, test_case_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_test_case_v_2();
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**testCaseId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_workspace(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_workspace({
  submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  workspaceRunDetails:{
    exception:{
      exceptionType:'exceptionType',
      exceptionMessage:'exceptionMessage',
      exceptionStacktrace:'exceptionStacktrace'
    },
    stdout:'stdout'
  },
  traceResponses:[{
    submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber:1,
    expressionLocation:{
      start:1,
      offset:1
    },
    stack:{
      numStackFrames:1,
      topStackFrame:{
        methodName:'methodName',
        lineNumber:1,
        scopes:[{
          variables:{}
        }, {
          variables:{}
        }]
      }
    },
    stdout:'stdout'
  }, {
    submissionId:'d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber:1,
    expressionLocation:{
      start:1,
      offset:1
    },
    stack:{
      numStackFrames:1,
      topStackFrame:{
        methodName:'methodName',
        lineNumber:1,
        scopes:[{
          variables:{}
        }, {
          variables:{}
        }]
      }
    },
    stdout:'stdout'
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**workspaceRunDetails:** `Seed::Submission::Types::WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**traceResponses:** `Internal::Types::Array[Seed::Submission::Types::TraceResponse]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.store_traced_workspace_v_2(submission_id, request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.admin.store_traced_workspace_v_2();
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

**submissionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Internal::Types::Array[Seed::Submission::Types::TraceResponseV2]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## homepage
<details><summary><code>client.homepage.get_homepage_problems() -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.get_homepage_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.set_homepage_problems(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.homepage.set_homepage_problems();
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

**request:** `Internal::Types::Array[String]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## migration
<details><summary><code>client.migration.get_attempted_migrations() -> Internal::Types::Array[Seed::Migration::Types::Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.migration.get_attempted_migrations({
  adminKeyHeader:'admin-key-header'
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

**adminKeyHeader:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## playlist
<details><summary><code>client.playlist.create_playlist(service_param, request) -> Seed::Playlist::Types::Playlist</code></summary>
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

```ruby
client.playlist.create_playlist({
  serviceParam:1,
  datetime:'2024-01-15T09:30:00Z',
  optionalDatetime:'2024-01-15T09:30:00Z'
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDatetime:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Playlist::Types::PlaylistCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.get_playlists(service_param) -> Internal::Types::Array[Seed::Playlist::Types::Playlist]</code></summary>
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

```ruby
client.playlist.get_playlists({
  serviceParam:1,
  limit:1,
  otherField:'otherField',
  multiLineDocs:'multiLineDocs'
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**otherField:** `String` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**multiLineDocs:** `String` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**optionalMultipleField:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**multipleField:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.get_playlist(service_param, playlist_id) -> Seed::Playlist::Types::Playlist</code></summary>
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

```ruby
client.playlist.get_playlist();
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.update_playlist(service_param, playlist_id, request) -> Seed::Playlist::Types::Playlist</code></summary>
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

```ruby
client.playlist.update_playlist({
  name:'name',
  problems:['problems', 'problems']
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Playlist::Types::UpdatePlaylistRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.delete_playlist(service_param, playlist_id) -> </code></summary>
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

```ruby
client.playlist.delete_playlist();
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

**serviceParam:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**playlistId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## problem
<details><summary><code>client.problem.create_problem(request) -> Seed::Problem::Types::CreateProblemResponse</code></summary>
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

```ruby
client.problem.create_problem({
  problemName:'problemName',
  problemDescription:{
    boards:[]
  },
  files:{},
  inputParams:[{
    name:'name'
  }, {
    name:'name'
  }],
  testcases:[{
    testCase:{
      id:'id',
      params:[]
    }
  }, {
    testCase:{
      id:'id',
      params:[]
    }
  }],
  methodName:'methodName'
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

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.update_problem(problem_id, request) -> Seed::Problem::Types::UpdateProblemResponse</code></summary>
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

```ruby
client.problem.update_problem({
  problemName:'problemName',
  problemDescription:{
    boards:[]
  },
  files:{},
  inputParams:[{
    name:'name'
  }, {
    name:'name'
  }],
  testcases:[{
    testCase:{
      id:'id',
      params:[]
    }
  }, {
    testCase:{
      id:'id',
      params:[]
    }
  }],
  methodName:'methodName'
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

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Problem::Types::CreateProblemRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.delete_problem(problem_id) -> </code></summary>
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

```ruby
client.problem.delete_problem();
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

**problemId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.get_default_starter_files(request) -> Seed::Problem::Types::GetDefaultStarterFilesResponse</code></summary>
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

```ruby
client.problem.get_default_starter_files({
  inputParams:[{
    name:'name'
  }, {
    name:'name'
  }],
  methodName:'methodName'
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

**inputParams:** `Internal::Types::Array[Seed::Problem::Types::VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**outputType:** `Seed::Commons::Types::VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**methodName:** `String` 

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

## submission
<details><summary><code>client.submission.create_execution_session(language) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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

```ruby
client.submission.create_execution_session();
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

**language:** `Seed::Commons::Types::Language` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.get_execution_session(session_id) -> Seed::Submission::Types::ExecutionSessionResponse</code></summary>
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

```ruby
client.submission.get_execution_session();
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

**sessionId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.stop_execution_session(session_id) -> </code></summary>
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

```ruby
client.submission.stop_execution_session();
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

**sessionId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.get_execution_sessions_state() -> Seed::Submission::Types::GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.submission.get_execution_sessions_state();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## sysprop
<details><summary><code>client.sysprop.set_num_warm_instances(language, num_warm_instances) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.set_num_warm_instances();
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

**language:** `Seed::Commons::Types::Language` 
    
</dd>
</dl>

<dl>
<dd>

**numWarmInstances:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.get_num_warm_instances() -> Internal::Types::Hash[Seed::Commons::Types::Language, Integer]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.sysprop.get_num_warm_instances();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## v_2 problem
<details><summary><code>client.v_2.problem.get_lightweight_problems() -> Internal::Types::Array[Seed::V2::Problem::Types::LightweightProblemInfoV2]</code></summary>
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

```ruby
client.v_2.problem.get_lightweight_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_problems() -> Internal::Types::Array[Seed::V2::Problem::Types::ProblemInfoV2]</code></summary>
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

```ruby
client.v_2.problem.get_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_latest_problem(problem_id) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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

```ruby
client.v_2.problem.get_latest_problem();
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

**problemId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.problem.get_problem_version(problem_id, problem_version) -> Seed::V2::Problem::Types::ProblemInfoV2</code></summary>
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

```ruby
client.v_2.problem.get_problem_version();
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

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## v_2 v_3 problem
<details><summary><code>client.v_2.v_3.problem.get_lightweight_problems() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::LightweightProblemInfoV2]</code></summary>
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

```ruby
client.v_2.problem.get_lightweight_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_problems() -> Internal::Types::Array[Seed::V2::V3::Problem::Types::ProblemInfoV2]</code></summary>
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

```ruby
client.v_2.problem.get_problems();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_latest_problem(problem_id) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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

```ruby
client.v_2.problem.get_latest_problem();
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

**problemId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v_2.v_3.problem.get_problem_version(problem_id, problem_version) -> Seed::V2::V3::Problem::Types::ProblemInfoV2</code></summary>
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

```ruby
client.v_2.problem.get_problem_version();
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

**problemId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**problemVersion:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
