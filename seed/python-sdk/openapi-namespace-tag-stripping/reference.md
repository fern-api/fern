# Reference
## Taskrouter Accounts AuthToken
<details><summary><code>client.taskrouter.accounts.auth_token.<a href="src/seed/taskrouter/accounts/auth_token/client.py">promote</a>() -&gt; AsyncHttpResponse[AuthToken]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    x_api_version="YOUR_X_API_VERSION",
)
client.taskrouter.accounts.auth_token.promote()

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

## Taskrouter Taskrouter Activity
<details><summary><code>client.taskrouter.taskrouter.activity.<a href="src/seed/taskrouter/taskrouter/activity/client.py">list</a>(...) -&gt; AsyncHttpResponse[ListActivityResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    x_api_version="YOUR_X_API_VERSION",
)
client.taskrouter.taskrouter.activity.list(
    workspace_sid="WorkspaceSid",
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

**workspace_sid:** `str` 
    
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

<details><summary><code>client.taskrouter.taskrouter.activity.<a href="src/seed/taskrouter/taskrouter/activity/client.py">create</a>(...) -&gt; AsyncHttpResponse[Activity]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    x_api_version="YOUR_X_API_VERSION",
)
client.taskrouter.taskrouter.activity.create(
    workspace_sid="WorkspaceSid",
    friendly_name="friendlyName",
    available=True,
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

**workspace_sid:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**friendly_name:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**available:** `typing.Optional[bool]` 
    
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

## Taskrouter Taskrouter Workspace
<details><summary><code>client.taskrouter.taskrouter.workspace.<a href="src/seed/taskrouter/taskrouter/workspace/client.py">list</a>() -&gt; AsyncHttpResponse[ListWorkspaceResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    x_api_version="YOUR_X_API_VERSION",
)
client.taskrouter.taskrouter.workspace.list()

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

## Taskrouter V2010 Message
<details><summary><code>client.taskrouter.v_2010.message.<a href="src/seed/taskrouter/v_2010/message/client.py">create</a>(...) -&gt; AsyncHttpResponse[Message]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    x_api_version="YOUR_X_API_VERSION",
)
client.taskrouter.v_2010.message.create(
    account_sid="AccountSid",
    to="to",
    from_="from",
    body="body",
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

**account_sid:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**to:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**body:** `typing.Optional[str]` 
    
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

