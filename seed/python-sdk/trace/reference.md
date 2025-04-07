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
