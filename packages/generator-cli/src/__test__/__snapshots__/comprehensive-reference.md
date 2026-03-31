# Reference
## Users
User management endpoints
<details><summary><code>client.users.<a href="/users/client.ts">list</a> -> <a href="/types/pagination.ts">Page&lt;User, ListUsersResponse&gt;</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users with pagination support
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const users = await client.users.list({ limit: 10 });
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

**limit:** `number` — Maximum number of users to return
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Record<string, string>` — Filter criteria for users
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/users/client.ts">get</a> -> <a href="/types/user.ts">User</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a specific user by ID
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const user = await client.users.get("user-123");
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

**userId:** `string` — The unique identifier for the user
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/users/client.ts">create</a> -> <a href="/types/user.ts">User</a></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const user = await client.users.create({
  name: "John Doe",
  email: "john@example.com"
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

**request:** [CreateUserRequest](/types/requests.ts) — User data for creation
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Organizations
Organization management endpoints
<details><summary><code>client.organizations.<a href="/orgs/client.ts">listMembers</a> -> <a href="/types/member.ts">Map&lt;string, Member&gt;</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get all members of an organization as a map keyed by user ID
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const members = await client.organizations.listMembers("org-456");
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

**organizationId:** `string` — The organization identifier
    
</dd>
</dl>

<dl>
<dd>

**options:** [ListMembersOptions](/types/options.ts) 

Optional parameters for filtering and pagination.
Supports multiple filter criteria.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/orgs/client.ts">getSettings</a> -> Promise&lt;Map&lt;string, unknown&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve organization settings with optional defaults
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const settings = await client.organizations.getSettings("org-456", { includeDefaults: true });
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

**organizationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**options:** `Record<string, boolean>` — Configuration options
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

