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

