# Reference
## TaskrouterV1Activity
<details><summary><code>client.taskrouter_v_1_activity.<a href="src/seed/taskrouter_v_1_activity/client.py">list_activities</a>(...) -&gt; AsyncHttpResponse[ListActivitiesResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.taskrouter_v_1_activity.list_activities(
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

<details><summary><code>client.taskrouter_v_1_activity.<a href="src/seed/taskrouter_v_1_activity/client.py">create_activity</a>(...) -&gt; AsyncHttpResponse[Activity]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.taskrouter_v_1_activity.create_activity(
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

## TaskrouterV1Workspace
<details><summary><code>client.taskrouter_v_1_workspace.<a href="src/seed/taskrouter_v_1_workspace/client.py">list_workspaces</a>() -&gt; AsyncHttpResponse[ListWorkspacesResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.taskrouter_v_1_workspace.list_workspaces()

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

## Api20100401Message
<details><summary><code>client.api_20100401_message.<a href="src/seed/api_20100401_message/client.py">create_message</a>(...) -&gt; AsyncHttpResponse[Message]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.api_20100401_message.create_message(
    account_sid="AccountSid",
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

## AccountsV1AuthToken
<details><summary><code>client.accounts_v_1_auth_token.<a href="src/seed/accounts_v_1_auth_token/client.py">promote_auth_token</a>() -&gt; AsyncHttpResponse[AuthToken]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.accounts_v_1_auth_token.promote_auth_token()

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

