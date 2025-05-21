# Reference
## V2
<details><summary><code>client.v_2.<a href="src/seed/v_2/client.py">test</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.test()

```
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
<details><summary><code>client.admin.<a href="src/seed/admin/client.py">update_test_submission_status</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.submission import TestSubmissionStatus

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.update_test_submission_status(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    request=TestSubmissionStatus(),
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">send_test_submission_update</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedTrace
from seed.submission import TestSubmissionUpdateInfo_Running

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.send_test_submission_update(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    update_time=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    update_info=TestSubmissionUpdateInfo_Running(value="QUEUEING_SUBMISSION"),
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

**update_time:** `dt.datetime` 
    
</dd>
</dl>

<dl>
<dd>

**update_info:** `TestSubmissionUpdateInfo` 
    
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">update_workspace_submission_status</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.submission import WorkspaceSubmissionStatus

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.update_workspace_submission_status(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    request=WorkspaceSubmissionStatus(),
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">send_workspace_submission_update</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedTrace
from seed.submission import WorkspaceSubmissionUpdateInfo_Running

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.send_workspace_submission_update(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    update_time=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    update_info=WorkspaceSubmissionUpdateInfo_Running(
        value="QUEUEING_SUBMISSION"
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

**update_time:** `dt.datetime` 
    
</dd>
</dl>

<dl>
<dd>

**update_info:** `WorkspaceSubmissionUpdateInfo` 
    
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">store_traced_test_case</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.commons import (
    DebugVariableValue_IntegerValue,
    VariableValue_IntegerValue,
)
from seed.submission import (
    ActualResult_Value,
    ExpressionLocation,
    Scope,
    StackFrame,
    StackInformation,
    TestCaseResult,
    TestCaseResultWithStdout,
    TraceResponse,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.store_traced_test_case(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    test_case_id="testCaseId",
    result=TestCaseResultWithStdout(
        result=TestCaseResult(
            expected_result=VariableValue_IntegerValue(value=1),
            actual_result=ActualResult_Value(
                value=VariableValue_IntegerValue(value=1)
            ),
            passed=True,
        ),
        stdout="stdout",
    ),
    trace_responses=[
        TraceResponse(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
        TraceResponse(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
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

**trace_responses:** `typing.Sequence[TraceResponse]` 
    
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">store_traced_test_case_v_2</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.commons import DebugVariableValue_IntegerValue
from seed.submission import (
    ExpressionLocation,
    Scope,
    StackFrame,
    StackInformation,
    TracedFile,
    TraceResponseV2,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.store_traced_test_case_v_2(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    test_case_id="testCaseId",
    request=[
        TraceResponseV2(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
        TraceResponseV2(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
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

**test_case_id:** `TestCaseId` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.Sequence[TraceResponseV2]` 
    
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">store_traced_workspace</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.commons import DebugVariableValue_IntegerValue
from seed.submission import (
    ExceptionInfo,
    ExceptionV2_Generic,
    ExpressionLocation,
    Scope,
    StackFrame,
    StackInformation,
    TraceResponse,
    WorkspaceRunDetails,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.store_traced_workspace(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    workspace_run_details=WorkspaceRunDetails(
        exception_v_2=ExceptionV2_Generic(
            exception_type="exceptionType",
            exception_message="exceptionMessage",
            exception_stacktrace="exceptionStacktrace",
        ),
        exception=ExceptionInfo(
            exception_type="exceptionType",
            exception_message="exceptionMessage",
            exception_stacktrace="exceptionStacktrace",
        ),
        stdout="stdout",
    ),
    trace_responses=[
        TraceResponse(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
        TraceResponse(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
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

**trace_responses:** `typing.Sequence[TraceResponse]` 
    
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

<details><summary><code>client.admin.<a href="src/seed/admin/client.py">store_traced_workspace_v_2</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedTrace
from seed.commons import DebugVariableValue_IntegerValue
from seed.submission import (
    ExpressionLocation,
    Scope,
    StackFrame,
    StackInformation,
    TracedFile,
    TraceResponseV2,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.admin.store_traced_workspace_v_2(
    submission_id=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    request=[
        TraceResponseV2(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
        TraceResponseV2(
            submission_id=uuid.UUID(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            line_number=1,
            file=TracedFile(
                filename="filename",
                directory="directory",
            ),
            return_value=DebugVariableValue_IntegerValue(value=1),
            expression_location=ExpressionLocation(
                start=1,
                offset=1,
            ),
            stack=StackInformation(
                num_stack_frames=1,
                top_stack_frame=StackFrame(
                    method_name="methodName",
                    line_number=1,
                    scopes=[
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                        Scope(
                            variables={
                                "variables": DebugVariableValue_IntegerValue(
                                    value=1
                                )
                            },
                        ),
                    ],
                ),
            ),
            stdout="stdout",
        ),
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

**request:** `typing.Sequence[TraceResponseV2]` 
    
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
<details><summary><code>client.homepage.<a href="src/seed/homepage/client.py">get_homepage_problems</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.homepage.get_homepage_problems()

```
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

<details><summary><code>client.homepage.<a href="src/seed/homepage/client.py">set_homepage_problems</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.homepage.set_homepage_problems(
    request=["string", "string"],
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

**request:** `typing.Sequence[ProblemId]` 
    
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
<details><summary><code>client.migration.<a href="src/seed/migration/client.py">get_attempted_migrations</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.migration.get_attempted_migrations(
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
<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">create_playlist</a>(...)</code></summary>
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
import datetime

from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.playlist.create_playlist(
    service_param=1,
    datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    optional_datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    name="name",
    problems=["problems", "problems"],
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

**datetime:** `dt.datetime` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**problems:** `typing.Sequence[ProblemId]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_datetime:** `typing.Optional[dt.datetime]` 
    
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

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">get_playlists</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.playlist.get_playlists(
    service_param=1,
    limit=1,
    other_field="otherField",
    multi_line_docs="multiLineDocs",
    optional_multiple_field="optionalMultipleField",
    multiple_field="multipleField",
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

**multiple_field:** `typing.Union[str, typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_multiple_field:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
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

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">get_playlist</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.playlist.get_playlist(
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

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">update_playlist</a>(...)</code></summary>
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
from seed import SeedTrace
from seed.playlist import UpdatePlaylistRequest

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.playlist.update_playlist(
    service_param=1,
    playlist_id="playlistId",
    request=UpdatePlaylistRequest(
        name="name",
        problems=["problems", "problems"],
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

**request:** `typing.Optional[UpdatePlaylistRequest]` 
    
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

<details><summary><code>client.playlist.<a href="src/seed/playlist/client.py">delete_playlist</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.playlist.delete_playlist(
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
<details><summary><code>client.problem.<a href="src/seed/problem/client.py">create_problem</a>(...)</code></summary>
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
from seed import SeedTrace
from seed.commons import (
    FileInfo,
    TestCase,
    TestCaseWithExpectedResult,
    VariableType,
    VariableValue_IntegerValue,
)
from seed.problem import (
    ProblemDescription,
    ProblemDescriptionBoard_Html,
    ProblemFiles,
    VariableTypeAndName,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.problem.create_problem(
    problem_name="problemName",
    problem_description=ProblemDescription(
        boards=[
            ProblemDescriptionBoard_Html(value="boards"),
            ProblemDescriptionBoard_Html(value="boards"),
        ],
    ),
    files={
        "JAVA": ProblemFiles(
            solution_file=FileInfo(
                filename="filename",
                contents="contents",
            ),
            read_only_files=[
                FileInfo(
                    filename="filename",
                    contents="contents",
                ),
                FileInfo(
                    filename="filename",
                    contents="contents",
                ),
            ],
        )
    },
    input_params=[
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
    ],
    output_type=VariableType(),
    testcases=[
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValue_IntegerValue(value=1),
                    VariableValue_IntegerValue(value=1),
                ],
            ),
            expected_result=VariableValue_IntegerValue(value=1),
        ),
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValue_IntegerValue(value=1),
                    VariableValue_IntegerValue(value=1),
                ],
            ),
            expected_result=VariableValue_IntegerValue(value=1),
        ),
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

**problem_name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**problem_description:** `ProblemDescription` 
    
</dd>
</dl>

<dl>
<dd>

**files:** `typing.Dict[Language, ProblemFiles]` 
    
</dd>
</dl>

<dl>
<dd>

**input_params:** `typing.Sequence[VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**testcases:** `typing.Sequence[TestCaseWithExpectedResult]` 
    
</dd>
</dl>

<dl>
<dd>

**method_name:** `str` 
    
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

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">update_problem</a>(...)</code></summary>
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
from seed import SeedTrace
from seed.commons import (
    FileInfo,
    TestCase,
    TestCaseWithExpectedResult,
    VariableType,
    VariableValue_IntegerValue,
)
from seed.problem import (
    ProblemDescription,
    ProblemDescriptionBoard_Html,
    ProblemFiles,
    VariableTypeAndName,
)

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.problem.update_problem(
    problem_id="problemId",
    problem_name="problemName",
    problem_description=ProblemDescription(
        boards=[
            ProblemDescriptionBoard_Html(value="boards"),
            ProblemDescriptionBoard_Html(value="boards"),
        ],
    ),
    files={
        "JAVA": ProblemFiles(
            solution_file=FileInfo(
                filename="filename",
                contents="contents",
            ),
            read_only_files=[
                FileInfo(
                    filename="filename",
                    contents="contents",
                ),
                FileInfo(
                    filename="filename",
                    contents="contents",
                ),
            ],
        )
    },
    input_params=[
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
    ],
    output_type=VariableType(),
    testcases=[
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValue_IntegerValue(value=1),
                    VariableValue_IntegerValue(value=1),
                ],
            ),
            expected_result=VariableValue_IntegerValue(value=1),
        ),
        TestCaseWithExpectedResult(
            test_case=TestCase(
                id="id",
                params=[
                    VariableValue_IntegerValue(value=1),
                    VariableValue_IntegerValue(value=1),
                ],
            ),
            expected_result=VariableValue_IntegerValue(value=1),
        ),
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

**problem_name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**problem_description:** `ProblemDescription` 
    
</dd>
</dl>

<dl>
<dd>

**files:** `typing.Dict[Language, ProblemFiles]` 
    
</dd>
</dl>

<dl>
<dd>

**input_params:** `typing.Sequence[VariableTypeAndName]` 
    
</dd>
</dl>

<dl>
<dd>

**output_type:** `VariableType` 
    
</dd>
</dl>

<dl>
<dd>

**testcases:** `typing.Sequence[TestCaseWithExpectedResult]` 
    
</dd>
</dl>

<dl>
<dd>

**method_name:** `str` 
    
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

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">delete_problem</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.problem.delete_problem(
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

<details><summary><code>client.problem.<a href="src/seed/problem/client.py">get_default_starter_files</a>(...)</code></summary>
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
from seed import SeedTrace
from seed.commons import VariableType
from seed.problem import VariableTypeAndName

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.problem.get_default_starter_files(
    input_params=[
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
        VariableTypeAndName(
            variable_type=VariableType(),
            name="name",
        ),
    ],
    output_type=VariableType(),
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

**input_params:** `typing.Sequence[VariableTypeAndName]` 
    
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
<details><summary><code>client.submission.<a href="src/seed/submission/client.py">create_execution_session</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.submission.create_execution_session(
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

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">get_execution_session</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.submission.get_execution_session(
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

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">stop_execution_session</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.submission.stop_execution_session(
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

<details><summary><code>client.submission.<a href="src/seed/submission/client.py">get_execution_sessions_state</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.submission.get_execution_sessions_state()

```
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
<details><summary><code>client.sysprop.<a href="src/seed/sysprop/client.py">set_num_warm_instances</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.sysprop.set_num_warm_instances(
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

<details><summary><code>client.sysprop.<a href="src/seed/sysprop/client.py">get_num_warm_instances</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.sysprop.get_num_warm_instances()

```
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

## V2 Problem
<details><summary><code>client.v_2.problem.<a href="src/seed/v_2/problem/client.py">get_lightweight_problems</a>()</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.problem.get_lightweight_problems()

```
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

<details><summary><code>client.v_2.problem.<a href="src/seed/v_2/problem/client.py">get_problems</a>()</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.problem.get_problems()

```
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

<details><summary><code>client.v_2.problem.<a href="src/seed/v_2/problem/client.py">get_latest_problem</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.problem.get_latest_problem(
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

<details><summary><code>client.v_2.problem.<a href="src/seed/v_2/problem/client.py">get_problem_version</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.problem.get_problem_version(
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

## V2 V3 Problem
<details><summary><code>client.v_2.v_3.problem.<a href="src/seed/v_2/v_3/problem/client.py">get_lightweight_problems</a>()</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.v_3.problem.get_lightweight_problems()

```
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

<details><summary><code>client.v_2.v_3.problem.<a href="src/seed/v_2/v_3/problem/client.py">get_problems</a>()</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.v_3.problem.get_problems()

```
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

<details><summary><code>client.v_2.v_3.problem.<a href="src/seed/v_2/v_3/problem/client.py">get_latest_problem</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.v_3.problem.get_latest_problem(
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

<details><summary><code>client.v_2.v_3.problem.<a href="src/seed/v_2/v_3/problem/client.py">get_problem_version</a>(...)</code></summary>
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
from seed import SeedTrace

client = SeedTrace(
    x_random_header="YOUR_X_RANDOM_HEADER",
    token="YOUR_TOKEN",
)
client.v_2.v_3.problem.get_problem_version(
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

