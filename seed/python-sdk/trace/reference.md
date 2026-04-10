# Reference
## V2
<details><summary><code>client.v2.<a href="src/seed/v2/client.py">test</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2.test()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Admin
<details><summary><code>client.admin.<a href="src/seed/admin/client.py">updatetestsubmissionstatus</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, TestSubmissionStatus_Stopped
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.updatetestsubmissionstatus(
    submission_id="submissionId",
    request=TestSubmissionStatus_Stopped(),
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">sendtestsubmissionupdate</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, TestSubmissionUpdateInfoZero
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.sendtestsubmissionupdate(
    submission_id="submissionId",
    update_time=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    update_info=TestSubmissionUpdateInfoZero(
        type="running",
    ),
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TestSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">updateworkspacesubmissionstatus</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, WorkspaceSubmissionStatusZero
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.updateworkspacesubmissionstatus(
    submission_id="submissionId",
    request=WorkspaceSubmissionStatusZero(
        type="stopped",
    ),
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionStatus` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">sendworkspacesubmissionupdate</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, WorkspaceSubmissionUpdateInfoZero
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.sendworkspacesubmissionupdate(
    submission_id="submissionId",
    update_time=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    update_info=WorkspaceSubmissionUpdateInfoZero(
        type="running",
    ),
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `WorkspaceSubmissionUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">storetracedtestcase</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, TestCaseResultWithStdout, TestCaseResult, VariableValueZero, ActualResultZero, TraceResponse, StackInformation
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.storetracedtestcase(
    submission_id="submissionId",
    test_case_id="testCaseId",
    result=TestCaseResultWithStdout(
        result=TestCaseResult(
            expected_result=VariableValueZero(
                type="integerValue",
            ),
            actual_result=ActualResultZero(
                type="value",
            ),
            passed=True,
        ),
        stdout="stdout",
    ),
    trace_responses=[
        TraceResponse(
            submission_id="submissionId",
            line_number=1,
            stack=StackInformation(
                num_stack_frames=1,
            ),
        )
    ],
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**result:** `TestCaseResultWithStdout` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `typing.List[TraceResponse]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">storetracedtestcasev2</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, TraceResponseV2, TracedFile, StackInformation
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.storetracedtestcasev2(
    submission_id="submissionId",
    test_case_id="testCaseId",
    request=[
        TraceResponseV2(
            submission_id="submissionId",
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            stack=StackInformation(
                num_stack_frames=1,
            ),
        )
    ],
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**test_case_id:** `V2TestCaseId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.List[TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">storetracedworkspace</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, WorkspaceRunDetails, TraceResponse, StackInformation
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.storetracedworkspace(
    submission_id="submissionId",
    workspace_run_details=WorkspaceRunDetails(
        stdout="stdout",
    ),
    trace_responses=[
        TraceResponse(
            submission_id="submissionId",
            line_number=1,
            stack=StackInformation(
                num_stack_frames=1,
            ),
        )
    ],
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**workspace_run_details:** `WorkspaceRunDetails` 
    
</dd>
</dl>

<dl>
<dd>

**trace_responses:** `typing.List[TraceResponse]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">storetracedworkspacev2</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, TraceResponseV2, TracedFile, StackInformation
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.admin.storetracedworkspacev2(
    submission_id="submissionId",
    request=[
        TraceResponseV2(
            submission_id="submissionId",
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            stack=StackInformation(
                num_stack_frames=1,
            ),
        )
    ],
)

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

**submission_id:** `SubmissionId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.List[TraceResponseV2]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Homepage
<details><summary><code>client.homepage.<a href="src/seed/homepage/client.py">gethomepageproblems</a>() -> typing.List[ProblemId]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.homepage.gethomepageproblems()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.homepage.<a href="src/seed/homepage/client.py">sethomepageproblems</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.homepage.sethomepageproblems(
    request=[
        "string"
    ],
)

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

**request:** `typing.List[ProblemId]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Migration
<details><summary><code>client.migration.<a href="src/seed/migration/client.py">getattemptedmigrations</a>(...) -> typing.List[Migration]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.migration.getattemptedmigrations(
    admin_key_header="admin-key-header",
)

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

**admin_key_header:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Playlist
<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">createplaylist</a>(...) -> Playlist</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.playlist.createplaylist(
    service_param=1,
    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    name="name",
    problems=[
        "problems"
    ],
)

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

**service_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `datetime.datetime` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PlaylistCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**optional_datetime:** `typing.Optional[datetime.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">getplaylists</a>(...) -> typing.List[Playlist]</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.playlist.getplaylists(
    service_param=1,
    limit=1,
    other_field="otherField",
    multi_line_docs="multiLineDocs",
    optional_multiple_field=[
        "optionalMultipleField"
    ],
    multiple_field=[
        "multipleField"
    ],
)

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

**service_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**other_field:** `str` — i'm another field
    
</dd>
</dl>

<dl>
<dd>

**multi_line_docs:** `str` 

I'm a multiline
description
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_multiple_field:** `typing.Optional[typing.Union[typing.Optional[str], typing.Sequence[typing.Optional[str]]]]` 
    
</dd>
</dl>

<dl>
<dd>

**multiple_field:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">getplaylist</a>(...) -> Playlist</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.playlist.getplaylist(
    service_param=1,
    playlist_id="playlistId",
)

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

**service_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">updateplaylist</a>(...) -> Playlist</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.playlist.updateplaylist(
    service_param=1,
    playlist_id="playlistId",
    name="name",
    problems=[
        "problems"
    ],
)

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

**service_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `typing.List[ProblemId]` — The problems that make up the playlist.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">deleteplaylist</a>(...)</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.playlist.deleteplaylist(
    service_param=1,
    playlist_id="playlist_id",
)

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

**service_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**playlist_id:** `PlaylistId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Problem
<details><summary><code>client.problem.<a href="src/seed/problem/client.py">createproblem</a>(...) -> CreateProblemResponse</code></summary>
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

```python
from seed import SeedApi, ProblemDescription, ProblemDescriptionBoard_Html, ProblemFiles, FileInfo, VariableTypeAndName, VariableTypeZero, TestCaseWithExpectedResult, TestCase, VariableValueZero
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.problem.createproblem(
    problem_name="problemName",
    problem_description=ProblemDescription(
        boards=[
            ProblemDescriptionBoard_Html()
        ],
    ),
    files={
        "key": ProblemFiles(
            solution_file=FileInfo(
                filename="filename",
                contents="contents",
            ),
            read_only_files=[
                FileInfo(
                    filename="filename",
                    contents="contents",
                )
            ],
        )
    },
    input_params=[
        VariableTypeAndName(
            variable_type=VariableTypeZero(
                type="integerType",
            ),
            name="name",
        )
    ],
    output_type=VariableTypeZero(
        type="integerType",
    ),
    testcases=[
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValueZero(
                        type="integerValue",
                    )
                ],
            ),
            expected_result=VariableValueZero(
                type="integerValue",
            ),
        )
    ],
    method_name="methodName",
)

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

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">updateproblem</a>(...) -> UpdateProblemResponse</code></summary>
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

```python
from seed import SeedApi, ProblemDescription, ProblemDescriptionBoard_Html, ProblemFiles, FileInfo, VariableTypeAndName, VariableTypeZero, TestCaseWithExpectedResult, TestCase, VariableValueZero
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.problem.updateproblem(
    problem_id="problemId",
    problem_name="problemName",
    problem_description=ProblemDescription(
        boards=[
            ProblemDescriptionBoard_Html()
        ],
    ),
    files={
        "key": ProblemFiles(
            solution_file=FileInfo(
                filename="filename",
                contents="contents",
            ),
            read_only_files=[
                FileInfo(
                    filename="filename",
                    contents="contents",
                )
            ],
        )
    },
    input_params=[
        VariableTypeAndName(
            variable_type=VariableTypeZero(
                type="integerType",
            ),
            name="name",
        )
    ],
    output_type=VariableTypeZero(
        type="integerType",
    ),
    testcases=[
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValueZero(
                        type="integerValue",
                    )
                ],
            ),
            expected_result=VariableValueZero(
                type="integerValue",
            ),
        )
    ],
    method_name="methodName",
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">deleteproblem</a>(...)</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.problem.deleteproblem(
    problem_id="problemId",
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">getdefaultstarterfiles</a>(...) -> GetDefaultStarterFilesResponse</code></summary>
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

```python
from seed import SeedApi, VariableTypeAndName, VariableTypeZero
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.problem.getdefaultstarterfiles(
    input_params=[
        VariableTypeAndName(
            variable_type=VariableTypeZero(
                type="integerType",
            ),
            name="name",
        )
    ],
    output_type=VariableTypeZero(
        type="integerType",
    ),
    method_name="methodName",
)

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

**input_params:** `typing.List[VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**method_name:** `str` 

The name of the `method` that the student has to complete.
The method name cannot include the following characters:
  - Greater Than `>`
  - Less Than `<``
  - Equals `=`
  - Period `.`
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Submission
<details><summary><code>client.submission.<a href="src/seed/submission/client.py">createexecutionsession</a>(...) -> ExecutionSessionResponse</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.submission.createexecutionsession(
    language="JAVA",
)

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">getexecutionsession</a>(...) -> ExecutionSessionResponse</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.submission.getexecutionsession(
    session_id="sessionId",
)

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

**session_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">stopexecutionsession</a>(...)</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.submission.stopexecutionsession(
    session_id="sessionId",
)

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

**session_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">getexecutionsessionsstate</a>() -> GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.submission.getexecutionsessionsstate()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Sysprop
<details><summary><code>client.sysprop.<a href="src/seed/sysprop/client.py">setnumwarminstances</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.sysprop.setnumwarminstances(
    language="JAVA",
    num_warm_instances=1,
)

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

**num_warm_instances:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.sysprop.<a href="src/seed/sysprop/client.py">getnumwarminstances</a>() -> typing.Dict[str, int]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.sysprop.getnumwarminstances()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2Problem
<details><summary><code>client.v2problem.<a href="src/seed/v2problem/client.py">v2problem_get_lightweight_problems</a>() -> typing.List[V2LightweightProblemInfoV2]</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2problem.v2problem_get_lightweight_problems()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="src/seed/v2problem/client.py">v2problem_get_problems</a>() -> typing.List[V2ProblemInfoV2]</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2problem.v2problem_get_problems()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="src/seed/v2problem/client.py">v2problem_get_latest_problem</a>(...) -> V2ProblemInfoV2</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2problem.v2problem_get_latest_problem(
    problem_id="problemId",
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2problem.<a href="src/seed/v2problem/client.py">v2problem_get_problem_version</a>(...) -> V2ProblemInfoV2</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2problem.v2problem_get_problem_version(
    problem_id="problemId",
    problem_version=1,
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2V3Problem
<details><summary><code>client.v2v3problem.<a href="src/seed/v2v3problem/client.py">v2v3problem_get_lightweight_problems</a>() -> typing.List[V2V3LightweightProblemInfoV2]</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2v3problem.v2v3problem_get_lightweight_problems()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="src/seed/v2v3problem/client.py">v2v3problem_get_problems</a>() -> typing.List[V2V3ProblemInfoV2]</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2v3problem.v2v3problem_get_problems()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="src/seed/v2v3problem/client.py">v2v3problem_get_latest_problem</a>(...) -> V2V3ProblemInfoV2</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2v3problem.v2v3problem_get_latest_problem(
    problem_id="problemId",
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.v2v3problem.<a href="src/seed/v2v3problem/client.py">v2v3problem_get_problem_version</a>(...) -> V2V3ProblemInfoV2</code></summary>
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

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v2v3problem.v2v3problem_get_problem_version(
    problem_id="problemId",
    problem_version=1,
)

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

**problem_id:** `ProblemId` 
    
</dd>
</dl>

<dl>
<dd>

**problem_version:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

