# Reference
## AcceptHeader Service
<details><summary><code>client.acceptHeader.service.<a href="/src/api/resources/acceptHeader/resources/service/client/Client.ts">endpoint</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.acceptHeader.service.endpoint();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Alias Alias
<details><summary><code>client.alias.alias.<a href="/src/api/resources/alias/resources/alias/client/Client.ts">get</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.alias.alias.get({
    typeId: "typeId"
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

**request:** `SeedApi.alias.GetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AliasClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## AliasExtends AliasExtends
<details><summary><code>client.aliasExtends.aliasExtends.<a href="/src/api/resources/aliasExtends/resources/aliasExtends/client/Client.ts">extendedInlineRequestBody</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.aliasExtends.aliasExtends.extendedInlineRequestBody({
    child: "child"
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

**request:** `SeedApi.aliasExtends.ExtendedInlineRequestBodyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AliasExtendsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Allof
<details><summary><code>client.allof.<a href="/src/api/resources/allof/client/Client.ts">searchRuleTypes</a>({ ...params }) -> SeedApi.RuleTypeSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.allof.searchRuleTypes();

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

**request:** `SeedApi.allof.SearchRuleTypesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AllofClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.allof.<a href="/src/api/resources/allof/client/Client.ts">createRule</a>({ ...params }) -> SeedApi.RuleResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.allof.createRule({
    name: "name",
    executionContext: "prod"
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

**request:** `SeedApi.allof.RuleCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AllofClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.allof.<a href="/src/api/resources/allof/client/Client.ts">listUsers</a>() -> SeedApi.UserSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.allof.listUsers();

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

**requestOptions:** `AllofClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.allof.<a href="/src/api/resources/allof/client/Client.ts">getEntity</a>() -> SeedApi.CombinedEntity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.allof.getEntity();

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

**requestOptions:** `AllofClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.allof.<a href="/src/api/resources/allof/client/Client.ts">getOrganization</a>() -> SeedApi.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.allof.getOrganization();

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

**requestOptions:** `AllofClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## AnyAuth Auth
<details><summary><code>client.anyAuth.auth.<a href="/src/api/resources/anyAuth/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.anyAuth.auth.getToken({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.anyAuth.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## AnyAuth User
<details><summary><code>client.anyAuth.user.<a href="/src/api/resources/anyAuth/resources/user/client/Client.ts">get</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.anyAuth.user.get();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.anyAuth.user.<a href="/src/api/resources/anyAuth/resources/user/client/Client.ts">getAdmins</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.anyAuth.user.getAdmins();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ApiWideBasePath Service
<details><summary><code>client.apiWideBasePath.service.<a href="/src/api/resources/apiWideBasePath/resources/service/client/Client.ts">post</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.apiWideBasePath.service.post({
    pathParam: "pathParam",
    serviceParam: "serviceParam",
    endpointParam: 1,
    resourceParam: "resourceParam"
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

**request:** `SeedApi.apiWideBasePath.PostServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Audiences Foo
<details><summary><code>client.audiences.foo.<a href="/src/api/resources/audiences/resources/foo/client/Client.ts">find</a>({ ...params }) -> SeedApi.ImportingType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.audiences.foo.find();

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

**request:** `SeedApi.audiences.FindFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FooClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Audiences FolderA Service
<details><summary><code>client.audiences.folderA.service.<a href="/src/api/resources/audiences/resources/folderA/resources/service/client/Client.ts">getDirectThread</a>({ ...params }) -> SeedApi.FolderAResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.audiences.folderA.service.getDirectThread({
    ids: ["ids"],
    tags: ["tags"]
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

**request:** `SeedApi.audiences.folderA.GetDirectThreadServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Audiences FolderD Service
<details><summary><code>client.audiences.folderD.service.<a href="/src/api/resources/audiences/resources/folderD/resources/service/client/Client.ts">getDirectThread</a>() -> SeedApi.FolderDResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.audiences.folderD.service.getDirectThread();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BasicAuth BasicAuth
<details><summary><code>client.basicAuth.basicAuth.<a href="/src/api/resources/basicAuth/resources/basicAuth/client/Client.ts">getWithBasicAuth</a>() -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
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
await client.basicAuth.basicAuth.getWithBasicAuth();

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

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.basicAuth.basicAuth.<a href="/src/api/resources/basicAuth/resources/basicAuth/client/Client.ts">postWithBasicAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
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
await client.basicAuth.basicAuth.postWithBasicAuth({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BasicAuthEnvironmentVariables BasicAuth
<details><summary><code>client.basicAuthEnvironmentVariables.basicAuth.<a href="/src/api/resources/basicAuthEnvironmentVariables/resources/basicAuth/client/Client.ts">getWithBasicAuth</a>() -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
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
await client.basicAuthEnvironmentVariables.basicAuth.getWithBasicAuth();

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

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.basicAuthEnvironmentVariables.basicAuth.<a href="/src/api/resources/basicAuthEnvironmentVariables/resources/basicAuth/client/Client.ts">postWithBasicAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
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
await client.basicAuthEnvironmentVariables.basicAuth.postWithBasicAuth({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BasicAuthPwOmitted BasicAuth
<details><summary><code>client.basicAuthPwOmitted.basicAuth.<a href="/src/api/resources/basicAuthPwOmitted/resources/basicAuth/client/Client.ts">getWithBasicAuth</a>() -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
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
await client.basicAuthPwOmitted.basicAuth.getWithBasicAuth();

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

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.basicAuthPwOmitted.basicAuth.<a href="/src/api/resources/basicAuthPwOmitted/resources/basicAuth/client/Client.ts">postWithBasicAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
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
await client.basicAuthPwOmitted.basicAuth.postWithBasicAuth({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BasicAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BearerTokenEnvironmentVariable Service
<details><summary><code>client.bearerTokenEnvironmentVariable.service.<a href="/src/api/resources/bearerTokenEnvironmentVariable/resources/service/client/Client.ts">getWithBearerToken</a>() -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
await client.bearerTokenEnvironmentVariable.service.getWithBearerToken();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BytesDownload Service
<details><summary><code>client.bytesDownload.service.<a href="/src/api/resources/bytesDownload/resources/service/client/Client.ts">simple</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bytesDownload.service.simple();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bytesDownload.service.<a href="/src/api/resources/bytesDownload/resources/service/client/Client.ts">download</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bytesDownload.service.download({
    id: "id"
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

**request:** `SeedApi.bytesDownload.DownloadServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## BytesUpload Service
## ClientSideParams Service
<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">listResources</a>({ ...params }) -> SeedApi.Resource[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
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
await client.clientSideParams.service.listResources({
    page: 1,
    per_page: 1,
    sort: "sort",
    order: "order",
    include_totals: true
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

**request:** `SeedApi.clientSideParams.ListResourcesServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">getResource</a>({ ...params }) -> SeedApi.Resource</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
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
await client.clientSideParams.service.getResource({
    resourceId: "resourceId",
    include_metadata: true,
    format: "format"
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

**request:** `SeedApi.clientSideParams.GetResourceServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">searchResources</a>({ ...params }) -> SeedApi.SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
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
await client.clientSideParams.service.searchResources({
    limit: 1,
    offset: 1
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

**request:** `SeedApi.clientSideParams.SearchResourcesServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">listUsers</a>({ ...params }) -> SeedApi.PaginatedUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List or search for users
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
await client.clientSideParams.service.listUsers();

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

**request:** `SeedApi.clientSideParams.ListUsersServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
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
await client.clientSideParams.service.createUser({
    email: "email",
    connection: "connection"
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

**request:** `SeedApi.clientSideParams.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">getUserById</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
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
await client.clientSideParams.service.getUserById({
    userId: "userId"
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

**request:** `SeedApi.clientSideParams.GetUserByIdServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">deleteUser</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a user
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
await client.clientSideParams.service.deleteUser({
    userId: "userId"
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

**request:** `SeedApi.clientSideParams.DeleteUserServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">updateUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user
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
await client.clientSideParams.service.updateUser({
    userId: "userId"
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

**request:** `SeedApi.clientSideParams.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">listConnections</a>({ ...params }) -> SeedApi.Connection[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all connections
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
await client.clientSideParams.service.listConnections();

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

**request:** `SeedApi.clientSideParams.ListConnectionsServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">getConnection</a>({ ...params }) -> SeedApi.Connection</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a connection by ID
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
await client.clientSideParams.service.getConnection({
    connectionId: "connectionId"
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

**request:** `SeedApi.clientSideParams.GetConnectionServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">listClients</a>({ ...params }) -> SeedApi.PaginatedClientResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all clients/applications
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
await client.clientSideParams.service.listClients();

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

**request:** `SeedApi.clientSideParams.ListClientsServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.clientSideParams.service.<a href="/src/api/resources/clientSideParams/resources/service/client/Client.ts">getClient</a>({ ...params }) -> SeedApi.Client</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a client by ID
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
await client.clientSideParams.service.getClient({
    clientId: "clientId"
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

**request:** `SeedApi.clientSideParams.GetClientServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ContentType Service
<details><summary><code>client.contentType.service.<a href="/src/api/resources/contentType/resources/service/client/Client.ts">patch</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.contentType.service.patch({});

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

**request:** `SeedApi.contentType.PatchServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.contentType.service.<a href="/src/api/resources/contentType/resources/service/client/Client.ts">patchComplex</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
await client.contentType.service.patchComplex({
    id: "id"
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

**request:** `SeedApi.contentType.PatchComplexServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.contentType.service.<a href="/src/api/resources/contentType/resources/service/client/Client.ts">namedPatchWithMixed</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
await client.contentType.service.namedPatchWithMixed({
    id: "id"
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

**request:** `SeedApi.contentType.NamedPatchWithMixedServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.contentType.service.<a href="/src/api/resources/contentType/resources/service/client/Client.ts">optionalMergePatchTest</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
await client.contentType.service.optionalMergePatchTest({
    requiredField: "requiredField"
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

**request:** `SeedApi.contentType.OptionalMergePatchTestServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.contentType.service.<a href="/src/api/resources/contentType/resources/service/client/Client.ts">regularPatch</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
await client.contentType.service.regularPatch({
    id: "id"
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

**request:** `SeedApi.contentType.RegularPatchServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CrossPackageTypeNames Foo
<details><summary><code>client.crossPackageTypeNames.foo.<a href="/src/api/resources/crossPackageTypeNames/resources/foo/client/Client.ts">find</a>({ ...params }) -> SeedApi.ImportingType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.crossPackageTypeNames.foo.find();

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

**request:** `SeedApi.crossPackageTypeNames.FindFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FooClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CrossPackageTypeNames FolderA Service
<details><summary><code>client.crossPackageTypeNames.folderA.service.<a href="/src/api/resources/crossPackageTypeNames/resources/folderA/resources/service/client/Client.ts">getDirectThread</a>() -> SeedApi.FolderAResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.crossPackageTypeNames.folderA.service.getDirectThread();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CrossPackageTypeNames FolderD Service
<details><summary><code>client.crossPackageTypeNames.folderD.service.<a href="/src/api/resources/crossPackageTypeNames/resources/folderD/resources/service/client/Client.ts">getDirectThread</a>() -> SeedApi.FolderDResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.crossPackageTypeNames.folderD.service.getDirectThread();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpInlineTypes CsharpInlineTypes
<details><summary><code>client.csharpInlineTypes.csharpInlineTypes.<a href="/src/api/resources/csharpInlineTypes/resources/csharpInlineTypes/client/Client.ts">getRoot</a>({ ...params }) -> SeedApi.RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpInlineTypes.csharpInlineTypes.getRoot({
    bar: {
        foo: "foo"
    },
    foo: "foo"
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

**request:** `SeedApi.csharpInlineTypes.GetRootRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.csharpInlineTypes.csharpInlineTypes.<a href="/src/api/resources/csharpInlineTypes/resources/csharpInlineTypes/client/Client.ts">getDiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpInlineTypes.csharpInlineTypes.getDiscriminatedUnion({
    bar: {
        foo: "foo",
        bar: {
            foo: "foo",
            ref: {
                foo: "foo"
            }
        },
        ref: {
            foo: "foo"
        },
        type: "type1"
    },
    foo: "foo"
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

**request:** `SeedApi.csharpInlineTypes.GetDiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.csharpInlineTypes.csharpInlineTypes.<a href="/src/api/resources/csharpInlineTypes/resources/csharpInlineTypes/client/Client.ts">getUndiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpInlineTypes.csharpInlineTypes.getUndiscriminatedUnion({
    bar: "SUNNY",
    foo: "foo"
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

**request:** `SeedApi.csharpInlineTypes.GetUndiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpPropertyNameCollision CsharpPropertyNameCollision
<details><summary><code>client.csharpPropertyNameCollision.csharpPropertyNameCollision.<a href="/src/api/resources/csharpPropertyNameCollision/resources/csharpPropertyNameCollision/client/Client.ts">createCatalog</a>({ ...params }) -> SeedApi.CatalogV1Id</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpPropertyNameCollision.csharpPropertyNameCollision.createCatalog({});

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

**request:** `SeedApi.CatalogV1Id` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpPropertyNameCollisionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.csharpPropertyNameCollision.csharpPropertyNameCollision.<a href="/src/api/resources/csharpPropertyNameCollision/resources/csharpPropertyNameCollision/client/Client.ts">createActivity</a>({ ...params }) -> SeedApi.Activity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpPropertyNameCollision.csharpPropertyNameCollision.createActivity({});

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

**request:** `SeedApi.Activity` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpPropertyNameCollisionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpReadonlyRequest CsharpReadonlyRequest
<details><summary><code>client.csharpReadonlyRequest.csharpReadonlyRequest.<a href="/src/api/resources/csharpReadonlyRequest/resources/csharpReadonlyRequest/client/Client.ts">batchCreate</a>({ ...params }) -> SeedApi.CreateVendorResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpReadonlyRequest.csharpReadonlyRequest.batchCreate({
    vendors: {
        "vendor-1": {
            id: "vendor-1",
            name: "Acme Corp",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
        }
    }
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

**request:** `SeedApi.csharpReadonlyRequest.CreateVendorRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpReadonlyRequestClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpSystemCollision CsharpSystemCollision
<details><summary><code>client.csharpSystemCollision.csharpSystemCollision.<a href="/src/api/resources/csharpSystemCollision/resources/csharpSystemCollision/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpSystemCollision.csharpSystemCollision.createUser({
    line1: "line1",
    city: "city",
    state: "state",
    zip: "zip",
    country: "USA"
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

**request:** `SeedApi.User` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpSystemCollisionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.csharpSystemCollision.csharpSystemCollision.<a href="/src/api/resources/csharpSystemCollision/resources/csharpSystemCollision/client/Client.ts">createTask</a>({ ...params }) -> SeedApi.Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpSystemCollision.csharpSystemCollision.createTask({
    name: "name",
    user: {
        line1: "line1",
        city: "city",
        state: "state",
        zip: "zip",
        country: "USA"
    }
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

**request:** `SeedApi.Task` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpSystemCollisionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.csharpSystemCollision.csharpSystemCollision.<a href="/src/api/resources/csharpSystemCollision/resources/csharpSystemCollision/client/Client.ts">emptyResponse</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpSystemCollision.csharpSystemCollision.emptyResponse({
    name: "name",
    user: {
        line1: "line1",
        city: "city",
        state: "state",
        zip: "zip",
        country: "USA"
    }
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

**request:** `SeedApi.Task` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CsharpSystemCollisionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpXmlEntities CsharpXmlEntities
<details><summary><code>client.csharpXmlEntities.csharpXmlEntities.<a href="/src/api/resources/csharpXmlEntities/resources/csharpXmlEntities/client/Client.ts">getTimeZone</a>() -> SeedApi.TimeZoneModel</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get timezone information with &plus; offset
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
await client.csharpXmlEntities.csharpXmlEntities.getTimeZone();

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

**requestOptions:** `CsharpXmlEntitiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CsharpNamespaceConflict Tasktest
<details><summary><code>client.csharpNamespaceConflict.tasktest.<a href="/src/api/resources/csharpNamespaceConflict/resources/tasktest/client/Client.ts">hello</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.csharpNamespaceConflict.tasktest.hello();

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

**requestOptions:** `TasktestClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointSecurityAuth Auth
<details><summary><code>client.endpointSecurityAuth.auth.<a href="/src/api/resources/endpointSecurityAuth/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.auth.getToken({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.endpointSecurityAuth.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointSecurityAuth User
<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithBearer</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithBearer();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithApiKey</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithApiKey();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithOAuth</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithOAuth();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithBasic</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithBasic();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithInferredAuth</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithInferredAuth();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithAnyAuth</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithAnyAuth();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpointSecurityAuth.user.<a href="/src/api/resources/endpointSecurityAuth/resources/user/client/Client.ts">getWithAllAuth</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpointSecurityAuth.user.getWithAllAuth();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Enum Headers
<details><summary><code>client.enum.headers.<a href="/src/api/resources/enum/resources/headers/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.headers.send({
    operand: ">",
    operandOrColor: "red"
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

**request:** `SeedApi.enum_.SendHeadersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Enum InlinedRequest
<details><summary><code>client.enum.inlinedRequest.<a href="/src/api/resources/enum/resources/inlinedRequest/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.inlinedRequest.send({
    operand: ">",
    operandOrColor: "red"
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

**request:** `SeedApi.enum_.SendInlinedRequestRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedRequestClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Enum MultipartForm
<details><summary><code>client.enum.multipartForm.<a href="/src/api/resources/enum/resources/multipartForm/client/Client.ts">multipartForm</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.multipartForm.multipartForm({});

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

**request:** `SeedApi.enum_.MultipartFormMultipartFormRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MultipartFormClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Enum PathParam
<details><summary><code>client.enum.pathParam.<a href="/src/api/resources/enum/resources/pathParam/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.pathParam.send({
    operand: ">",
    operandOrColor: "red"
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

**request:** `SeedApi.enum_.SendPathParamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PathParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Enum QueryParam
<details><summary><code>client.enum.queryParam.<a href="/src/api/resources/enum/resources/queryParam/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.queryParam.send({
    operand: ">",
    operandOrColor: "red"
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

**request:** `SeedApi.enum_.SendQueryParamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.enum.queryParam.<a href="/src/api/resources/enum/resources/queryParam/client/Client.ts">sendList</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.enum.queryParam.sendList({
    operand: [">"],
    operandOrColor: ["red"]
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

**request:** `SeedApi.enum_.SendListQueryParamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ErrorProperty PropertyBasedError
<details><summary><code>client.errorProperty.propertyBasedError.<a href="/src/api/resources/errorProperty/resources/propertyBasedError/client/Client.ts">throwError</a>() -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request that always throws an error
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
await client.errorProperty.propertyBasedError.throwError();

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

**requestOptions:** `PropertyBasedErrorClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Errors Simple
<details><summary><code>client.errors.simple.<a href="/src/api/resources/errors/resources/simple/client/Client.ts">fooWithoutEndpointError</a>({ ...params }) -> SeedApi.FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.errors.simple.fooWithoutEndpointError({
    bar: "hello"
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

**request:** `SeedApi.FooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.errors.simple.<a href="/src/api/resources/errors/resources/simple/client/Client.ts">foo</a>({ ...params }) -> SeedApi.FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.errors.simple.foo({
    bar: "hello"
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

**request:** `SeedApi.FooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.errors.simple.<a href="/src/api/resources/errors/resources/simple/client/Client.ts">fooWithExamples</a>({ ...params }) -> SeedApi.FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.errors.simple.fooWithExamples({
    bar: "hello"
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

**request:** `SeedApi.FooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Examples Examples
<details><summary><code>client.examples.examples.<a href="/src/api/resources/examples/resources/examples/client/Client.ts">echo</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.examples.echo("Hello world!\\n\\nwith\\n\\tnewlines");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.examples.<a href="/src/api/resources/examples/resources/examples/client/Client.ts">createType</a>({ ...params }) -> SeedApi.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.examples.createType("primitive");

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

**request:** `SeedApi.Type` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Examples Service
<details><summary><code>client.examples.service.<a href="/src/api/resources/examples/resources/service/client/Client.ts">getMovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.service.getMovie({
    movieId: "movieId"
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

**request:** `SeedApi.examples.GetMovieServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.service.<a href="/src/api/resources/examples/resources/service/client/Client.ts">createMovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.service.createMovie({
    id: "movie-c06a4ad7",
    prequel: "movie-cv9b914f",
    title: "The Boy and the Heron",
    from: "Hayao Miyazaki",
    rating: 8,
    type: "movie",
    tag: "tag-wf9as23d",
    metadata: {
        "actors": [
            "Christian Bale",
            "Florence Pugh",
            "Willem Dafoe"
        ],
        "releaseDate": "2023-12-08",
        "ratings": {
            "rottenTomatoes": 97,
            "imdb": 7.6
        }
    },
    revenue: 1000000
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

**request:** `SeedApi.Movie` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.service.<a href="/src/api/resources/examples/resources/service/client/Client.ts">getMetadata</a>({ ...params }) -> SeedApi.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.service.getMetadata();

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

**request:** `SeedApi.examples.GetMetadataServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.service.<a href="/src/api/resources/examples/resources/service/client/Client.ts">createBigEntity</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.service.createBigEntity();

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

**request:** `SeedApi.examples.BigEntity` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.service.<a href="/src/api/resources/examples/resources/service/client/Client.ts">refreshToken</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.service.refreshToken({
    ttl: 1
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

**request:** `SeedApi.RefreshTokenRequest | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Examples File Service
<details><summary><code>client.examples.file.service.<a href="/src/api/resources/examples/resources/file/resources/service/client/Client.ts">getFile</a>({ ...params }) -> SeedApi.File_</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
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
await client.examples.file.service.getFile({
    filename: "file.txt"
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

**request:** `SeedApi.examples.file.GetFileServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Examples File Notification Service
<details><summary><code>client.examples.file.notification.service.<a href="/src/api/resources/examples/resources/file/resources/notification/resources/service/client/Client.ts">getException</a>({ ...params }) -> SeedApi.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.examples.file.notification.service.getException({
    notificationId: "notification-hsy129x"
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

**request:** `SeedApi.examples.file.notification.GetExceptionServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Examples Health Service
<details><summary><code>client.examples.health.service.<a href="/src/api/resources/examples/resources/health/resources/service/client/Client.ts">check</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
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
await client.examples.health.service.check({
    id: "id-2sdx82h"
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

**request:** `SeedApi.examples.health.CheckServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.examples.health.service.<a href="/src/api/resources/examples/resources/health/resources/service/client/Client.ts">ping</a>() -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
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
await client.examples.health.service.ping();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive EndpointsHttpMethods
<details><summary><code>client.exhaustive.endpointsHttpMethods.<a href="/src/api/resources/exhaustive/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestGet</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestGet({
    id: "id"
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

**request:** `SeedApi.exhaustive.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsHttpMethods.<a href="/src/api/resources/exhaustive/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPut</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPut({
    id: "id",
    body: {
        string: "uploaded"
    }
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

**request:** `SeedApi.exhaustive.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsHttpMethods.<a href="/src/api/resources/exhaustive/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestDelete</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestDelete({
    id: "id"
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

**request:** `SeedApi.exhaustive.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsHttpMethods.<a href="/src/api/resources/exhaustive/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPatch</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPatch({
    id: "id",
    body: {}
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

**request:** `SeedApi.exhaustive.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsHttpMethods.<a href="/src/api/resources/exhaustive/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPost</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPost({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive EndpointsUrLs
<details><summary><code>client.exhaustive.endpointsUrLs.<a href="/src/api/resources/exhaustive/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithMixedCase</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsUrLs.endpointsUrlsWithMixedCase();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsUrLs.<a href="/src/api/resources/exhaustive/resources/endpointsUrLs/client/Client.ts">endpointsUrlsNoEndingSlash</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsUrLs.endpointsUrlsNoEndingSlash();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsUrLs.<a href="/src/api/resources/exhaustive/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithEndingSlash</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsUrLs.endpointsUrlsWithEndingSlash();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpointsUrLs.<a href="/src/api/resources/exhaustive/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithUnderscores</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpointsUrLs.endpointsUrlsWithUnderscores();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive InlinedRequests
<details><summary><code>client.exhaustive.inlinedRequests.<a href="/src/api/resources/exhaustive/resources/inlinedRequests/client/Client.ts">postWithObjectBodyandResponse</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
await client.exhaustive.inlinedRequests.postWithObjectBodyandResponse({
    string: "string",
    integer: 1,
    NestedObject: {}
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

**request:** `SeedApi.exhaustive.PostWithObjectBodyandResponseInlinedRequestsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedRequestsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive NoAuth
<details><summary><code>client.exhaustive.noAuth.<a href="/src/api/resources/exhaustive/resources/noAuth/client/Client.ts">postWithNoAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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
await client.exhaustive.noAuth.postWithNoAuth({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NoAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive NoReqBody
<details><summary><code>client.exhaustive.noReqBody.<a href="/src/api/resources/exhaustive/resources/noReqBody/client/Client.ts">getWithNoRequestBody</a>() -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.noReqBody.getWithNoRequestBody();

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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.noReqBody.<a href="/src/api/resources/exhaustive/resources/noReqBody/client/Client.ts">postWithNoRequestBody</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.noReqBody.postWithNoRequestBody();

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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive ReqWithHeaders
<details><summary><code>client.exhaustive.reqWithHeaders.<a href="/src/api/resources/exhaustive/resources/reqWithHeaders/client/Client.ts">getWithCustomHeader</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.reqWithHeaders.getWithCustomHeader({
    testEndpointHeader: "X-TEST-ENDPOINT-HEADER",
    body: "string"
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

**request:** `SeedApi.exhaustive.GetWithCustomHeaderReqWithHeadersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReqWithHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Container
<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfPrimitives</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnListOfPrimitives(["string"]);

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

**request:** `string[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnListOfObjects([{
        string: "uploaded"
    }]);

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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfPrimitives</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnSetOfPrimitives(["string"]);

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

**request:** `string[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnSetOfObjects([{
        string: "uploaded"
    }]);

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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapPrimToPrim</a>({ ...params }) -> Record&lt;string, string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnMapPrimToPrim({
    "key": "value"
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

**request:** `Record<string, string>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToObject</a>({ ...params }) -> Record&lt;string, SeedApi.TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnMapOfPrimToObject({
    "key": {
        string: "uploaded"
    }
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

**request:** `Record<string, SeedApi.TypesObjectWithRequiredField>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToUndiscriminatedUnion</a>({ ...params }) -> Record&lt;string, SeedApi.TypesMixedType&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
    "key": 1.1
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

**request:** `Record<string, SeedApi.TypesMixedType>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.container.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/container/client/Client.ts">getAndReturnOptional</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.container.getAndReturnOptional({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints ContentType
<details><summary><code>client.exhaustive.endpoints.contentType.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.contentType.postJsonPatchContentType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.contentType.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentWithCharsetType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.contentType.postJsonPatchContentWithCharsetType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Enum
<details><summary><code>client.exhaustive.endpoints.enum.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/enum/client/Client.ts">getAndReturnEnum</a>({ ...params }) -> SeedApi.TypesWeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.enum.getAndReturnEnum("SUNNY");

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

**request:** `SeedApi.TypesWeatherReport` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EnumClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Object
<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithOptionalField</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnWithOptionalField({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredField</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnWithRequiredField({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMapOfMap</a>({ ...params }) -> SeedApi.TypesObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnWithMapOfMap({
    map: {
        "key": {
            "key": "value"
        }
    }
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

**request:** `SeedApi.TypesObjectWithMapOfMap` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithOptionalField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnNestedWithOptionalField({});

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

**request:** `SeedApi.TypesNestedObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnNestedWithRequiredField({
    string: "string",
    body: {
        string: "string",
        NestedObject: {}
    }
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

**request:** `SeedApi.exhaustive.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredFieldAsList</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
        string: "string",
        NestedObject: {}
    }]);

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

**request:** `SeedApi.TypesNestedObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithUnknownField</a>({ ...params }) -> SeedApi.TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnWithUnknownField({
    unknown: {
        "$ref": "https://example.com/schema"
    }
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

**request:** `SeedApi.TypesObjectWithUnknownField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithDocumentedUnknownType</a>({ ...params }) -> SeedApi.TypesObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnWithDocumentedUnknownType({
    documentedUnknownType: {
        "key": "value"
    }
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

**request:** `SeedApi.TypesObjectWithDocumentedUnknownType` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnMapOfDocumentedUnknownType</a>({ ...params }) -> SeedApi.TypesMapOfDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.object.getAndReturnMapOfDocumentedUnknownType({});

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

**request:** `SeedApi.TypesMapOfDocumentedUnknownType` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMixedRequiredAndOptionalFields</a>({ ...params }) -> SeedApi.TypesObjectWithMixedRequiredAndOptionalFields</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
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
await client.exhaustive.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields({
    requiredString: "hello",
    requiredInteger: 0,
    optionalString: "world",
    requiredLong: 0
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

**request:** `SeedApi.TypesObjectWithMixedRequiredAndOptionalFields` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredNestedObject</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredNestedObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
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
await client.exhaustive.endpoints.object.getAndReturnWithRequiredNestedObject({
    requiredString: "hello",
    requiredObject: {
        string: "nested",
        NestedObject: {}
    }
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

**request:** `SeedApi.TypesObjectWithRequiredNestedObject` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.object.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithDatetimeLikeString</a>({ ...params }) -> SeedApi.TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
await client.exhaustive.endpoints.object.getAndReturnWithDatetimeLikeString({
    datetimeLikeString: "2023-08-31T14:15:22Z",
    actualDatetime: "2023-08-31T14:15:22Z"
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

**request:** `SeedApi.TypesObjectWithDatetimeLikeString` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Pagination
<details><summary><code>client.exhaustive.endpoints.pagination.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/pagination/client/Client.ts">listItems</a>({ ...params }) -> SeedApi.EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
await client.exhaustive.endpoints.pagination.listItems();

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

**request:** `SeedApi.exhaustive.endpoints.ListItemsPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaginationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Params
<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithPath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
await client.exhaustive.endpoints.params.getWithPath({
    param: "param"
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

**request:** `SeedApi.exhaustive.endpoints.GetWithPathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">modifyWithPath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
await client.exhaustive.endpoints.params.modifyWithPath({
    param: "param",
    body: "string"
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

**request:** `SeedApi.exhaustive.endpoints.ModifyWithPathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithInlinePath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
await client.exhaustive.endpoints.params.getWithInlinePath({
    param: "param"
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

**request:** `SeedApi.exhaustive.endpoints.GetWithInlinePathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">modifyWithInlinePath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
await client.exhaustive.endpoints.params.modifyWithInlinePath({
    param: "param",
    body: "string"
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

**request:** `SeedApi.exhaustive.endpoints.ModifyWithInlinePathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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
await client.exhaustive.endpoints.params.getWithQuery({
    query: "query",
    number: 1
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

**request:** `SeedApi.exhaustive.endpoints.GetWithQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithAllowMultipleQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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
await client.exhaustive.endpoints.params.getWithAllowMultipleQuery({
    query: ["query"],
    number: [1]
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

**request:** `SeedApi.exhaustive.endpoints.GetWithAllowMultipleQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithPathAndQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
await client.exhaustive.endpoints.params.getWithPathAndQuery({
    param: "param",
    query: "query"
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

**request:** `SeedApi.exhaustive.endpoints.GetWithPathAndQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithInlinePathAndQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
await client.exhaustive.endpoints.params.getWithInlinePathAndQuery({
    param: "param",
    query: "query"
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

**request:** `SeedApi.exhaustive.endpoints.GetWithInlinePathAndQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithBooleanPath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
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
await client.exhaustive.endpoints.params.getWithBooleanPath({
    param: true
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

**request:** `SeedApi.exhaustive.endpoints.GetWithBooleanPathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.params.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/params/client/Client.ts">getWithPathAndErrors</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
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
await client.exhaustive.endpoints.params.getWithPathAndErrors({
    param: "param"
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

**request:** `SeedApi.exhaustive.endpoints.GetWithPathAndErrorsParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Primitive
<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnString</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnString("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnInt</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnInt(1);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnLong</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnLong(1000000);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDouble</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnDouble(1.1);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBool</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnBool(true);

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

**request:** `boolean` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDatetime</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDate</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnDate("2023-01-15");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnUuid</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnUuid("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.exhaustive.endpoints.primitive.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBase64</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.primitive.getAndReturnBase64("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Put
<details><summary><code>client.exhaustive.endpoints.put.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/put/client/Client.ts">add</a>({ ...params }) -> SeedApi.EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.put.add({
    id: "id"
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

**request:** `SeedApi.exhaustive.endpoints.AddPutRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PutClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Exhaustive Endpoints Union
<details><summary><code>client.exhaustive.endpoints.union.<a href="/src/api/resources/exhaustive/resources/endpoints/resources/union/client/Client.ts">getAndReturnUnion</a>({ ...params }) -> SeedApi.TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.exhaustive.endpoints.union.getAndReturnUnion({
    name: "name",
    likesToWoof: true,
    animal: "dog"
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

**request:** `SeedApi.TypesAnimal` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Extends Extends
<details><summary><code>client.extends.extends.<a href="/src/api/resources/extends/resources/extends/client/Client.ts">extendedInlineRequestBody</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.extends.extends.extendedInlineRequestBody({
    docs: "Types extend this type to include a docs property.",
    name: "Example",
    unique: "unique"
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

**request:** `SeedApi.extends_.ExtendedInlineRequestBodyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ExtendsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ExtraProperties User
<details><summary><code>client.extraProperties.user.<a href="/src/api/resources/extraProperties/resources/user/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.extraProperties.user.createUser({
    _type: "CreateUserRequest",
    _version: "v1",
    name: "Alice"
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

**request:** `SeedApi.extraProperties.CreateUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileDownload Service
<details><summary><code>client.fileDownload.service.<a href="/src/api/resources/fileDownload/resources/service/client/Client.ts">simple</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileDownload.service.simple();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileDownload.service.<a href="/src/api/resources/fileDownload/resources/service/client/Client.ts">downloadFile</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileDownload.service.downloadFile();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileUpload Service
<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">post</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.post({});

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

**request:** `SeedApi.fileUpload.PostServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">justFile</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.justFile({});

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

**request:** `SeedApi.fileUpload.JustFileServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">justFileWithQueryParams</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.justFileWithQueryParams({
    integer: 1,
    listOfStrings: ["listOfStrings"]
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

**request:** `SeedApi.fileUpload.JustFileWithQueryParamsServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">justFileWithOptionalQueryParams</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.justFileWithOptionalQueryParams({});

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

**request:** `SeedApi.fileUpload.JustFileWithOptionalQueryParamsServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withContentType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withContentType({});

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

**request:** `SeedApi.fileUpload.WithContentTypeServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withFormEncoding</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withFormEncoding({});

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

**request:** `SeedApi.fileUpload.WithFormEncodingServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withFormEncodedContainers</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withFormEncodedContainers({});

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

**request:** `SeedApi.fileUpload.WithFormEncodedContainersServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">optionalArgs</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.optionalArgs({});

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

**request:** `SeedApi.fileUpload.OptionalArgsServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withInlineType</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withInlineType({});

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

**request:** `SeedApi.fileUpload.WithInlineTypeServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withJsonProperty</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withJsonProperty({});

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

**request:** `SeedApi.fileUpload.WithJsonPropertyServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withRefBody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withRefBody({});

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

**request:** `SeedApi.fileUpload.WithRefBodyServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">simple</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.simple();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fileUpload.service.<a href="/src/api/resources/fileUpload/resources/service/client/Client.ts">withLiteralAndEnumTypes</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.fileUpload.service.withLiteralAndEnumTypes({});

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

**request:** `SeedApi.fileUpload.WithLiteralAndEnumTypesServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Folders Folders
<details><summary><code>client.folders.folders.<a href="/src/api/resources/folders/resources/folders/client/Client.ts">foo</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.folders.foo();

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

**requestOptions:** `FoldersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Folders AB
<details><summary><code>client.folders.aB.<a href="/src/api/resources/folders/resources/aB/client/Client.ts">aBFoo</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.aB.aBFoo();

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

**requestOptions:** `ABClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Folders AC
<details><summary><code>client.folders.aC.<a href="/src/api/resources/folders/resources/aC/client/Client.ts">aCFoo</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.aC.aCFoo();

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

**requestOptions:** `ACClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Folders Folder
<details><summary><code>client.folders.folder.<a href="/src/api/resources/folders/resources/folder/client/Client.ts">foo</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.folder.foo();

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

**requestOptions:** `FolderClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Folders Folder Service
<details><summary><code>client.folders.folder.service.<a href="/src/api/resources/folders/resources/folder/resources/service/client/Client.ts">endpoint</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.folder.service.endpoint();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.folders.folder.service.<a href="/src/api/resources/folders/resources/folder/resources/service/client/Client.ts">unknownRequest</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.folders.folder.service.unknownRequest({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoOptionalLiteralAlias GoOptionalLiteralAlias
<details><summary><code>client.goOptionalLiteralAlias.goOptionalLiteralAlias.<a href="/src/api/resources/goOptionalLiteralAlias/resources/goOptionalLiteralAlias/client/Client.ts">search</a>({ ...params }) -> SeedApi.SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goOptionalLiteralAlias.goOptionalLiteralAlias.search({
    sortField: "DEFAULT",
    query: "test query"
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

**request:** `SeedApi.goOptionalLiteralAlias.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `GoOptionalLiteralAliasClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoBytesRequest Service
## GoContentType Imdb
<details><summary><code>client.goContentType.imdb.<a href="/src/api/resources/goContentType/resources/imdb/client/Client.ts">createMovie</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database
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
await client.goContentType.imdb.createMovie({
    title: "title",
    rating: 1.1
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

**request:** `SeedApi.goContentType.CreateMovieRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering EndpointsHttpMethods
<details><summary><code>client.goDeterministicOrdering.endpointsHttpMethods.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestGet</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestGet({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsHttpMethods.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPut</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPut({
    id: "id",
    body: {
        string: "uploaded"
    }
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

**request:** `SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsHttpMethods.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestDelete</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestDelete({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsHttpMethods.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPatch</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPatch({
    id: "id",
    body: {}
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

**request:** `SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsHttpMethods.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsHttpMethods/client/Client.ts">endpointsHttpMethodsTestPost</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPost({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EndpointsHttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering EndpointsUrLs
<details><summary><code>client.goDeterministicOrdering.endpointsUrLs.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithMixedCase</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsUrLs.endpointsUrlsWithMixedCase();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsUrLs.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsUrLs/client/Client.ts">endpointsUrlsNoEndingSlash</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsUrLs.endpointsUrlsNoEndingSlash();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsUrLs.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithEndingSlash</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsUrLs.endpointsUrlsWithEndingSlash();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpointsUrLs.<a href="/src/api/resources/goDeterministicOrdering/resources/endpointsUrLs/client/Client.ts">endpointsUrlsWithUnderscores</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpointsUrLs.endpointsUrlsWithUnderscores();

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

**requestOptions:** `EndpointsUrLsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering InlinedRequests
<details><summary><code>client.goDeterministicOrdering.inlinedRequests.<a href="/src/api/resources/goDeterministicOrdering/resources/inlinedRequests/client/Client.ts">postWithObjectBodyandResponse</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
await client.goDeterministicOrdering.inlinedRequests.postWithObjectBodyandResponse({
    string: "string",
    integer: 1,
    NestedObject: {}
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

**request:** `SeedApi.goDeterministicOrdering.PostWithObjectBodyandResponseInlinedRequestsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedRequestsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering NoAuth
<details><summary><code>client.goDeterministicOrdering.noAuth.<a href="/src/api/resources/goDeterministicOrdering/resources/noAuth/client/Client.ts">postWithNoAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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
await client.goDeterministicOrdering.noAuth.postWithNoAuth({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NoAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering NoReqBody
<details><summary><code>client.goDeterministicOrdering.noReqBody.<a href="/src/api/resources/goDeterministicOrdering/resources/noReqBody/client/Client.ts">getWithNoRequestBody</a>() -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.noReqBody.getWithNoRequestBody();

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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.noReqBody.<a href="/src/api/resources/goDeterministicOrdering/resources/noReqBody/client/Client.ts">postWithNoRequestBody</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.noReqBody.postWithNoRequestBody();

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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering ReqWithHeaders
<details><summary><code>client.goDeterministicOrdering.reqWithHeaders.<a href="/src/api/resources/goDeterministicOrdering/resources/reqWithHeaders/client/Client.ts">getWithCustomHeader</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.reqWithHeaders.getWithCustomHeader({
    testEndpointHeader: "X-TEST-ENDPOINT-HEADER",
    body: "string"
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

**request:** `SeedApi.goDeterministicOrdering.GetWithCustomHeaderReqWithHeadersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReqWithHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Container
<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfPrimitives</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnListOfPrimitives(["string"]);

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

**request:** `string[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnListOfObjects([{
        string: "uploaded"
    }]);

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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfPrimitives</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnSetOfPrimitives(["string"]);

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

**request:** `string[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnSetOfObjects([{
        string: "uploaded"
    }]);

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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapPrimToPrim</a>({ ...params }) -> Record&lt;string, string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnMapPrimToPrim({
    "key": "value"
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

**request:** `Record<string, string>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToObject</a>({ ...params }) -> Record&lt;string, SeedApi.TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnMapOfPrimToObject({
    "key": {
        string: "uploaded"
    }
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

**request:** `Record<string, SeedApi.TypesObjectWithRequiredField>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToUndiscriminatedUnion</a>({ ...params }) -> Record&lt;string, SeedApi.TypesMixedType&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
    "key": 1.1
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

**request:** `Record<string, SeedApi.TypesMixedType>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.container.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/container/client/Client.ts">getAndReturnOptional</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.container.getAndReturnOptional({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints ContentType
<details><summary><code>client.goDeterministicOrdering.endpoints.contentType.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.contentType.postJsonPatchContentType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.contentType.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentWithCharsetType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.contentType.postJsonPatchContentWithCharsetType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints DuplicateNamesA
<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesA.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesA/client/Client.ts">list</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List endpoint for service A
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
await client.goDeterministicOrdering.endpoints.duplicateNamesA.list();

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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesARequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesAClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesA.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesA/client/Client.ts">create</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create endpoint for service A
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
await client.goDeterministicOrdering.endpoints.duplicateNamesA.create({
    name: "name",
    value: 1
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesARequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesAClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesA.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesA/client/Client.ts">get</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get endpoint for service A
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
await client.goDeterministicOrdering.endpoints.duplicateNamesA.get({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesARequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesAClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints DuplicateNamesB
<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesB.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesB/client/Client.ts">list</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List endpoint for service B
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
await client.goDeterministicOrdering.endpoints.duplicateNamesB.list();

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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesBRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesBClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesB.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesB/client/Client.ts">create</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create endpoint for service B
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
await client.goDeterministicOrdering.endpoints.duplicateNamesB.create({
    description: "description",
    count: 1
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesBRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesBClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesB.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesB/client/Client.ts">get</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get endpoint for service B
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
await client.goDeterministicOrdering.endpoints.duplicateNamesB.get({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesBRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesBClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints DuplicateNamesC
<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesC.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesC/client/Client.ts">list</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List endpoint for service C
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
await client.goDeterministicOrdering.endpoints.duplicateNamesC.list();

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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesCRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesCClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesC.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesC/client/Client.ts">create</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create endpoint for service C
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
await client.goDeterministicOrdering.endpoints.duplicateNamesC.create({
    label: "label",
    priority: 1
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesCRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesCClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.duplicateNamesC.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/duplicateNamesC/client/Client.ts">get</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get endpoint for service C
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
await client.goDeterministicOrdering.endpoints.duplicateNamesC.get({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesCRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DuplicateNamesCClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Enum
<details><summary><code>client.goDeterministicOrdering.endpoints.enum.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/enum/client/Client.ts">getAndReturnEnum</a>({ ...params }) -> SeedApi.TypesWeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.enum.getAndReturnEnum("SUNNY");

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

**request:** `SeedApi.TypesWeatherReport` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EnumClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Object
<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithOptionalField</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnWithOptionalField({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredField</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnWithRequiredField({
    string: "uploaded"
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMapOfMap</a>({ ...params }) -> SeedApi.TypesObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnWithMapOfMap({
    map: {
        "key": {
            "key": "value"
        }
    }
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

**request:** `SeedApi.TypesObjectWithMapOfMap` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithOptionalField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithOptionalField({});

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

**request:** `SeedApi.TypesNestedObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithRequiredField({
    string: "string",
    body: {
        string: "string",
        NestedObject: {}
    }
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredFieldAsList</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
        string: "string",
        NestedObject: {}
    }]);

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

**request:** `SeedApi.TypesNestedObjectWithRequiredField[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithUnknownField</a>({ ...params }) -> SeedApi.TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.object.getAndReturnWithUnknownField({
    unknown: {
        "$ref": "https://example.com/schema"
    }
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

**request:** `SeedApi.TypesObjectWithUnknownField` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.object.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithDatetimeLikeString</a>({ ...params }) -> SeedApi.TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
await client.goDeterministicOrdering.endpoints.object.getAndReturnWithDatetimeLikeString({
    datetimeLikeString: "2023-08-31T14:15:22Z",
    actualDatetime: "2023-08-31T14:15:22Z"
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

**request:** `SeedApi.TypesObjectWithDatetimeLikeString` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Pagination
<details><summary><code>client.goDeterministicOrdering.endpoints.pagination.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/pagination/client/Client.ts">listItems</a>({ ...params }) -> SeedApi.EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
await client.goDeterministicOrdering.endpoints.pagination.listItems();

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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ListItemsPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaginationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Params
<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithPath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
await client.goDeterministicOrdering.endpoints.params.getWithPath({
    param: "param"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithPathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">modifyWithPath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
await client.goDeterministicOrdering.endpoints.params.modifyWithPath({
    param: "param",
    body: "string"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ModifyWithPathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithInlinePath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
await client.goDeterministicOrdering.endpoints.params.getWithInlinePath({
    param: "param"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">modifyWithInlinePath</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
await client.goDeterministicOrdering.endpoints.params.modifyWithInlinePath({
    param: "param",
    body: "string"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.ModifyWithInlinePathParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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
await client.goDeterministicOrdering.endpoints.params.getWithQuery({
    query: "query",
    number: 1
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithAllowMultipleQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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
await client.goDeterministicOrdering.endpoints.params.getWithAllowMultipleQuery({
    query: ["query"],
    number: [1]
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithAllowMultipleQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithPathAndQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
await client.goDeterministicOrdering.endpoints.params.getWithPathAndQuery({
    param: "param",
    query: "query"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithPathAndQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.params.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/params/client/Client.ts">getWithInlinePathAndQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
await client.goDeterministicOrdering.endpoints.params.getWithInlinePathAndQuery({
    param: "param",
    query: "query"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathAndQueryParamsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Primitive
<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnString</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnString("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnInt</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnInt(1);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnLong</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnLong(1000000);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDouble</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnDouble(1.1);

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

**request:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBool</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnBool(true);

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

**request:** `boolean` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDatetime</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDate</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnDate("2023-01-15");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnUuid</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnUuid("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.goDeterministicOrdering.endpoints.primitive.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBase64</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.primitive.getAndReturnBase64("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Put
<details><summary><code>client.goDeterministicOrdering.endpoints.put.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/put/client/Client.ts">add</a>({ ...params }) -> SeedApi.EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.put.add({
    id: "id"
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

**request:** `SeedApi.goDeterministicOrdering.endpoints.AddPutRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PutClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoDeterministicOrdering Endpoints Union
<details><summary><code>client.goDeterministicOrdering.endpoints.union.<a href="/src/api/resources/goDeterministicOrdering/resources/endpoints/resources/union/client/Client.ts">getAndReturnUnion</a>({ ...params }) -> SeedApi.TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.goDeterministicOrdering.endpoints.union.getAndReturnUnion({
    name: "name",
    likesToWoof: true,
    animal: "dog"
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

**request:** `SeedApi.TypesAnimal` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GoUndiscriminatedUnionWireTests Service
<details><summary><code>client.goUndiscriminatedUnionWireTests.service.<a href="/src/api/resources/goUndiscriminatedUnionWireTests/resources/service/client/Client.ts">rerank</a>({ ...params }) -> SeedApi.RerankResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Rerank documents based on relevance to a query
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
await client.goUndiscriminatedUnionWireTests.service.rerank({
    documents: [{
            text: "Carson City is the capital city of the American state of Nevada."
        }, {
            text: "Washington, D.C. is the capital of the United States."
        }],
    query: "What is the capital of the United States?"
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

**request:** `SeedApi.goUndiscriminatedUnionWireTests.RerankRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HttpHead User
<details><summary><code>client.httpHead.user.<a href="/src/api/resources/httpHead/resources/user/client/Client.ts">list</a>({ ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.httpHead.user.list({
    limit: 1
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

**request:** `SeedApi.httpHead.ListUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.httpHead.user.<a href="/src/api/resources/httpHead/resources/user/client/Client.ts">head</a>() -> Headers</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.httpHead.user.head();

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

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## IdempotencyHeaders Payment
<details><summary><code>client.idempotencyHeaders.payment.<a href="/src/api/resources/idempotencyHeaders/resources/payment/client/Client.ts">create</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.idempotencyHeaders.payment.create({
    amount: 1,
    currency: "USD"
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

**request:** `SeedApi.idempotencyHeaders.CreatePaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaymentClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.idempotencyHeaders.payment.<a href="/src/api/resources/idempotencyHeaders/resources/payment/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.idempotencyHeaders.payment.delete({
    paymentId: "paymentId"
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

**request:** `SeedApi.idempotencyHeaders.DeletePaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaymentClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Imdb Imdb
<details><summary><code>client.imdb.imdb.<a href="/src/api/resources/imdb/resources/imdb/client/Client.ts">createMovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database using the movies/* /... path.
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
await client.imdb.imdb.createMovie({
    title: "title",
    rating: 1.1
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

**request:** `SeedApi.imdb.CreateMovieRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.imdb.imdb.<a href="/src/api/resources/imdb/resources/imdb/client/Client.ts">getMovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.imdb.imdb.getMovie({
    movieId: "movieId"
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

**request:** `SeedApi.imdb.GetMovieImdbRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthExplicit Auth
<details><summary><code>client.inferredAuthExplicit.auth.<a href="/src/api/resources/inferredAuthExplicit/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthExplicit.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.inferredAuthExplicit.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inferredAuthExplicit.auth.<a href="/src/api/resources/inferredAuthExplicit/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthExplicit.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.inferredAuthExplicit.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthExplicit NestedNoAuthApi
<details><summary><code>client.inferredAuthExplicit.nestedNoAuthApi.<a href="/src/api/resources/inferredAuthExplicit/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthExplicit.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthExplicit NestedApi
<details><summary><code>client.inferredAuthExplicit.nestedApi.<a href="/src/api/resources/inferredAuthExplicit/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthExplicit.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthExplicit Simple
<details><summary><code>client.inferredAuthExplicit.simple.<a href="/src/api/resources/inferredAuthExplicit/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthExplicit.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicit Auth
<details><summary><code>client.inferredAuthImplicit.auth.<a href="/src/api/resources/inferredAuthImplicit/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicit.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.inferredAuthImplicit.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inferredAuthImplicit.auth.<a href="/src/api/resources/inferredAuthImplicit/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicit.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.inferredAuthImplicit.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicit NestedNoAuthApi
<details><summary><code>client.inferredAuthImplicit.nestedNoAuthApi.<a href="/src/api/resources/inferredAuthImplicit/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicit.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicit NestedApi
<details><summary><code>client.inferredAuthImplicit.nestedApi.<a href="/src/api/resources/inferredAuthImplicit/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicit.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicit Simple
<details><summary><code>client.inferredAuthImplicit.simple.<a href="/src/api/resources/inferredAuthImplicit/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicit.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitApiKey Auth
<details><summary><code>client.inferredAuthImplicitApiKey.auth.<a href="/src/api/resources/inferredAuthImplicitApiKey/resources/auth/client/Client.ts">getToken</a>() -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitApiKey.auth.getToken();

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

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitApiKey NestedNoAuthApi
<details><summary><code>client.inferredAuthImplicitApiKey.nestedNoAuthApi.<a href="/src/api/resources/inferredAuthImplicitApiKey/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitApiKey.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitApiKey NestedApi
<details><summary><code>client.inferredAuthImplicitApiKey.nestedApi.<a href="/src/api/resources/inferredAuthImplicitApiKey/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitApiKey.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitApiKey Simple
<details><summary><code>client.inferredAuthImplicitApiKey.simple.<a href="/src/api/resources/inferredAuthImplicitApiKey/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitApiKey.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitNoExpiry Auth
<details><summary><code>client.inferredAuthImplicitNoExpiry.auth.<a href="/src/api/resources/inferredAuthImplicitNoExpiry/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitNoExpiry.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.inferredAuthImplicitNoExpiry.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inferredAuthImplicitNoExpiry.auth.<a href="/src/api/resources/inferredAuthImplicitNoExpiry/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitNoExpiry.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.inferredAuthImplicitNoExpiry.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitNoExpiry NestedNoAuthApi
<details><summary><code>client.inferredAuthImplicitNoExpiry.nestedNoAuthApi.<a href="/src/api/resources/inferredAuthImplicitNoExpiry/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitNoExpiry.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitNoExpiry NestedApi
<details><summary><code>client.inferredAuthImplicitNoExpiry.nestedApi.<a href="/src/api/resources/inferredAuthImplicitNoExpiry/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitNoExpiry.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitNoExpiry Simple
<details><summary><code>client.inferredAuthImplicitNoExpiry.simple.<a href="/src/api/resources/inferredAuthImplicitNoExpiry/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitNoExpiry.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitReference Auth
<details><summary><code>client.inferredAuthImplicitReference.auth.<a href="/src/api/resources/inferredAuthImplicitReference/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitReference.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.inferredAuthImplicitReference.GetTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inferredAuthImplicitReference.auth.<a href="/src/api/resources/inferredAuthImplicitReference/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitReference.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.RefreshTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitReference NestedNoAuthApi
<details><summary><code>client.inferredAuthImplicitReference.nestedNoAuthApi.<a href="/src/api/resources/inferredAuthImplicitReference/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitReference.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitReference NestedApi
<details><summary><code>client.inferredAuthImplicitReference.nestedApi.<a href="/src/api/resources/inferredAuthImplicitReference/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitReference.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InferredAuthImplicitReference Simple
<details><summary><code>client.inferredAuthImplicitReference.simple.<a href="/src/api/resources/inferredAuthImplicitReference/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inferredAuthImplicitReference.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaDefaultTimeout JavaDefaultTimeout
<details><summary><code>client.javaDefaultTimeout.javaDefaultTimeout.<a href="/src/api/resources/javaDefaultTimeout/resources/javaDefaultTimeout/client/Client.ts">getUser</a>() -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaDefaultTimeout.javaDefaultTimeout.getUser();

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

**requestOptions:** `JavaDefaultTimeoutClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaInlineTypes JavaInlineTypes
<details><summary><code>client.javaInlineTypes.javaInlineTypes.<a href="/src/api/resources/javaInlineTypes/resources/javaInlineTypes/client/Client.ts">getRoot</a>({ ...params }) -> SeedApi.RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaInlineTypes.javaInlineTypes.getRoot({
    bar: {
        foo: "foo"
    },
    foo: "foo"
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

**request:** `SeedApi.javaInlineTypes.GetRootRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaInlineTypes.javaInlineTypes.<a href="/src/api/resources/javaInlineTypes/resources/javaInlineTypes/client/Client.ts">getDiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaInlineTypes.javaInlineTypes.getDiscriminatedUnion({
    bar: {
        foo: "foo",
        bar: {
            foo: "foo",
            ref: {
                foo: "foo"
            }
        },
        ref: {
            foo: "foo"
        },
        type: "type1"
    },
    foo: "foo"
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

**request:** `SeedApi.javaInlineTypes.GetDiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaInlineTypes.javaInlineTypes.<a href="/src/api/resources/javaInlineTypes/resources/javaInlineTypes/client/Client.ts">getUndiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaInlineTypes.javaInlineTypes.getUndiscriminatedUnion({
    bar: "SUNNY",
    foo: "foo"
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

**request:** `SeedApi.javaInlineTypes.GetUndiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaOptionalNullableQueryParams JavaOptionalNullableQueryParams
<details><summary><code>client.javaOptionalNullableQueryParams.javaOptionalNullableQueryParams.<a href="/src/api/resources/javaOptionalNullableQueryParams/resources/javaOptionalNullableQueryParams/client/Client.ts">search</a>({ ...params }) -> SeedApi.SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search endpoint with optional nullable query params with defaults
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
await client.javaOptionalNullableQueryParams.javaOptionalNullableQueryParams.search();

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

**request:** `SeedApi.javaOptionalNullableQueryParams.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaOptionalNullableQueryParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaOptionalQueryParamsOverloads JavaOptionalQueryParamsOverloads
<details><summary><code>client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.<a href="/src/api/resources/javaOptionalQueryParamsOverloads/resources/javaOptionalQueryParamsOverloads/client/Client.ts">getLatestInsurance</a>({ ...params }) -> SeedApi.InsurancePolicy</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get latest insurance for a user. All query params are optional.
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
await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.getLatestInsurance({
    userId: "userId"
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

**request:** `SeedApi.javaOptionalQueryParamsOverloads.GetLatestInsuranceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaOptionalQueryParamsOverloadsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.<a href="/src/api/resources/javaOptionalQueryParamsOverloads/resources/javaOptionalQueryParamsOverloads/client/Client.ts">searchPolicies</a>({ ...params }) -> SeedApi.InsurancePolicy[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search policies with required query params
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
await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.searchPolicies({
    query: "query"
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

**request:** `SeedApi.javaOptionalQueryParamsOverloads.SearchPoliciesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaOptionalQueryParamsOverloadsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.<a href="/src/api/resources/javaOptionalQueryParamsOverloads/resources/javaOptionalQueryParamsOverloads/client/Client.ts">listAllPolicies</a>() -> SeedApi.InsurancePolicy[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all policies
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
await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.listAllPolicies();

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

**requestOptions:** `JavaOptionalQueryParamsOverloadsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaPathParamKeyConflict
<details><summary><code>client.javaPathParamKeyConflict.<a href="/src/api/resources/javaPathParamKeyConflict/client/Client.ts">createItem</a>({ ...params }) -> SeedApi.Item</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaPathParamKeyConflict.createItem({
    key: "key",
    value: "value",
    data: "data"
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

**request:** `SeedApi.javaPathParamKeyConflict.ItemData` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaPathParamKeyConflictClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaRequiredBodyOptionalHeaders JavaRequiredBodyOptionalHeaders
<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">getUsers</a>({ ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get all users with optional filtering.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.getUsers();

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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.GetUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user. Has required body and optional header.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUser({
    body: {
        name: "name",
        email: "email"
    }
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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">updateUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update an existing user. Has required body and optional query param.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.updateUser({
    userId: "userId",
    body: {
        name: "name",
        email: "email"
    }
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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">createUserWithOptions</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with optional header and query param.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithOptions({
    body: {
        name: "name",
        email: "email"
    }
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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithOptionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">createUserWithRequiredHeader</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with required header.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithRequiredHeader({
    name: "name",
    email: "email"
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

**request:** `SeedApi.UserData` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">createUserWithRequiredQuery</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with required query param.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithRequiredQuery({
    tenantId: "tenantId",
    body: {
        name: "name",
        email: "email"
    }
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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithRequiredQueryRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.<a href="/src/api/resources/javaRequiredBodyOptionalHeaders/resources/javaRequiredBodyOptionalHeaders/client/Client.ts">createUserInlined</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a user with inlined body and optional header.
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
await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserInlined({
    name: "name",
    email: "email"
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

**request:** `SeedApi.javaRequiredBodyOptionalHeaders.CreateUserInlinedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `JavaRequiredBodyOptionalHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaBuilderExtension Service
<details><summary><code>client.javaBuilderExtension.service.<a href="/src/api/resources/javaBuilderExtension/resources/service/client/Client.ts">hello</a>() -> SeedApi.HelloResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaBuilderExtension.service.hello();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaCustomPackagePrefix Imdb
<details><summary><code>client.javaCustomPackagePrefix.imdb.<a href="/src/api/resources/javaCustomPackagePrefix/resources/imdb/client/Client.ts">createMovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database
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
await client.javaCustomPackagePrefix.imdb.createMovie({
    title: "title",
    rating: 1.1
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

**request:** `SeedApi.javaCustomPackagePrefix.CreateMovieRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaCustomPackagePrefix.imdb.<a href="/src/api/resources/javaCustomPackagePrefix/resources/imdb/client/Client.ts">getMovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaCustomPackagePrefix.imdb.getMovie({
    movieId: "movieId"
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

**request:** `SeedApi.javaCustomPackagePrefix.GetMovieImdbRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaOutputDirectory Service
<details><summary><code>client.javaOutputDirectory.service.<a href="/src/api/resources/javaOutputDirectory/resources/service/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaOutputDirectory.service.getUser({
    userId: "userId"
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

**request:** `SeedApi.javaOutputDirectory.GetUserServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaPaginationDeepCursorPath DeepCursorPath
<details><summary><code>client.javaPaginationDeepCursorPath.deepCursorPath.<a href="/src/api/resources/javaPaginationDeepCursorPath/resources/deepCursorPath/client/Client.ts">doThing</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaPaginationDeepCursorPath.deepCursorPath.doThing({});

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

**request:** `SeedApi.A` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DeepCursorPathClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaPaginationDeepCursorPath.deepCursorPath.<a href="/src/api/resources/javaPaginationDeepCursorPath/resources/deepCursorPath/client/Client.ts">doThingRequired</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaPaginationDeepCursorPath.deepCursorPath.doThingRequired({
    indirection: {
        results: ["results"]
    }
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

**request:** `SeedApi.javaPaginationDeepCursorPath.MainRequired` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DeepCursorPathClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaPaginationDeepCursorPath.deepCursorPath.<a href="/src/api/resources/javaPaginationDeepCursorPath/resources/deepCursorPath/client/Client.ts">doThingInline</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaPaginationDeepCursorPath.deepCursorPath.doThingInline();

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

**request:** `SeedApi.javaPaginationDeepCursorPath.InlineA` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DeepCursorPathClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaSinglePropertyEndpoint SingleProperty
<details><summary><code>client.javaSinglePropertyEndpoint.singleProperty.<a href="/src/api/resources/javaSinglePropertyEndpoint/resources/singleProperty/client/Client.ts">doThing</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaSinglePropertyEndpoint.singleProperty.doThing({
    id: "id"
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

**request:** `SeedApi.javaSinglePropertyEndpoint.DoThingSinglePropertyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SinglePropertyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaStagedBuilderOrdering Service
<details><summary><code>client.javaStagedBuilderOrdering.service.<a href="/src/api/resources/javaStagedBuilderOrdering/resources/service/client/Client.ts">createSimple</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStagedBuilderOrdering.service.createSimple({
    first: "a",
    second: "b",
    third: "c"
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

**request:** `SeedApi.SimpleStaged` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaStagedBuilderOrdering.service.<a href="/src/api/resources/javaStagedBuilderOrdering/resources/service/client/Client.ts">createMedium</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStagedBuilderOrdering.service.createMedium({
    alpha: "alpha",
    beta: 1,
    gamma: "gamma",
    delta: true,
    optional: "optional"
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

**request:** `SeedApi.javaStagedBuilderOrdering.MediumStaged` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaStagedBuilderOrdering.service.<a href="/src/api/resources/javaStagedBuilderOrdering/resources/service/client/Client.ts">createComplex</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStagedBuilderOrdering.service.createComplex({
    fieldA: "a",
    fieldB: 1,
    fieldC: true,
    fieldD: "d",
    fieldE: 1.5,
    optionalX: "x",
    optionalY: 2,
    optionalZ: false
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

**request:** `SeedApi.javaStagedBuilderOrdering.ComplexStaged` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaStagedBuilderOrdering.service.<a href="/src/api/resources/javaStagedBuilderOrdering/resources/service/client/Client.ts">createMixed</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStagedBuilderOrdering.service.createMixed({
    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    name: "test",
    timestamp: "2024-01-15T09:30:00Z",
    nested: {
        first: "a",
        second: "b",
        third: "c"
    },
    count: 42
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

**request:** `SeedApi.javaStagedBuilderOrdering.MixedStaged` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaStagedBuilderOrdering.service.<a href="/src/api/resources/javaStagedBuilderOrdering/resources/service/client/Client.ts">createParent</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStagedBuilderOrdering.service.createParent({
    parentId: "parent-123",
    child: {
        childId: "child-456",
        childValue: 789
    },
    parentName: "Parent Name"
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

**request:** `SeedApi.Parent` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## JavaStreamingAcceptHeader Dummy
<details><summary><code>client.javaStreamingAcceptHeader.dummy.<a href="/src/api/resources/javaStreamingAcceptHeader/resources/dummy/client/Client.ts">generateStream</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStreamingAcceptHeader.dummy.generateStream({
    num_events: 1
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

**request:** `SeedApi.javaStreamingAcceptHeader.GenerateStreamDummyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.javaStreamingAcceptHeader.dummy.<a href="/src/api/resources/javaStreamingAcceptHeader/resources/dummy/client/Client.ts">generate</a>({ ...params }) -> SeedApi.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.javaStreamingAcceptHeader.dummy.generate({
    num_events: 5
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

**request:** `SeedApi.javaStreamingAcceptHeader.GenerateDummyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## License License
<details><summary><code>client.license.license.<a href="/src/api/resources/license/resources/license/client/Client.ts">get</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.license.license.get();

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

**requestOptions:** `LicenseClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Literal Headers
<details><summary><code>client.literal.headers.<a href="/src/api/resources/literal/resources/headers/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literal.headers.send({
    endpointVersion: "02-12-2024",
    async: true,
    query: "What is the weather today"
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

**request:** `SeedApi.literal.SendHeadersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Literal Inlined
<details><summary><code>client.literal.inlined.<a href="/src/api/resources/literal/resources/inlined/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literal.inlined.send({
    prompt: "You are a helpful assistant",
    context: "You're super wise",
    query: "What is the weather today",
    temperature: 10.1,
    stream: false,
    aliasedContext: "You're super wise",
    maybeContext: "You're super wise",
    objectWithLiteral: {
        nestedLiteral: {
            myLiteral: "How super cool"
        }
    }
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

**request:** `SeedApi.literal.SendInlinedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Literal Path
<details><summary><code>client.literal.path.<a href="/src/api/resources/literal/resources/path/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literal.path.send({
    id: "123"
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

**request:** `SeedApi.literal.SendPathRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PathClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Literal Query
<details><summary><code>client.literal.query.<a href="/src/api/resources/literal/resources/query/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literal.query.send({
    prompt: "You are a helpful assistant",
    alias_prompt: "You are a helpful assistant",
    query: "What is the weather today",
    stream: true,
    alias_stream: true
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

**request:** `SeedApi.literal.SendQueryRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Literal Reference
<details><summary><code>client.literal.reference.<a href="/src/api/resources/literal/resources/reference/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literal.reference.send({
    prompt: "You are a helpful assistant",
    query: "What is the weather today",
    stream: false,
    ending: "\\$ending",
    context: "You're super wise",
    containerObject: {
        nestedObjects: [{
                literal1: "literal1",
                literal2: "literal2",
                strProp: "strProp"
            }]
    }
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

**request:** `SeedApi.literal.SendRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReferenceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## LiteralUserAgent LiteralUserAgent
<details><summary><code>client.literalUserAgent.literalUserAgent.<a href="/src/api/resources/literalUserAgent/resources/literalUserAgent/client/Client.ts">ping</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.literalUserAgent.literalUserAgent.ping();

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

**requestOptions:** `LiteralUserAgentClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MixedCase Service
<details><summary><code>client.mixedCase.service.<a href="/src/api/resources/mixedCase/resources/service/client/Client.ts">getResource</a>({ ...params }) -> SeedApi.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.mixedCase.service.getResource({
    ResourceID: "rsc-xyz"
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

**request:** `SeedApi.mixedCase.GetResourceServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.mixedCase.service.<a href="/src/api/resources/mixedCase/resources/service/client/Client.ts">listResources</a>({ ...params }) -> SeedApi.Resource[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.mixedCase.service.listResources({
    page_limit: 1,
    beforeDate: "2023-01-01"
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

**request:** `SeedApi.mixedCase.ListResourcesServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MixedFileDirectory Organization
<details><summary><code>client.mixedFileDirectory.organization.<a href="/src/api/resources/mixedFileDirectory/resources/organization/client/Client.ts">create</a>({ ...params }) -> SeedApi.Organization</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new organization.
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
await client.mixedFileDirectory.organization.create({
    name: "name"
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

**request:** `SeedApi.mixedFileDirectory.CreateOrganizationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MixedFileDirectory User
<details><summary><code>client.mixedFileDirectory.user.<a href="/src/api/resources/mixedFileDirectory/resources/user/client/Client.ts">list</a>({ ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users.
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
await client.mixedFileDirectory.user.list();

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

**request:** `SeedApi.mixedFileDirectory.ListUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MixedFileDirectory User Events
<details><summary><code>client.mixedFileDirectory.user.events.<a href="/src/api/resources/mixedFileDirectory/resources/user/resources/events/client/Client.ts">listEvents</a>({ ...params }) -> SeedApi.UserEvent[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all user events.
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
await client.mixedFileDirectory.user.events.listEvents();

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

**request:** `SeedApi.mixedFileDirectory.user.ListEventsEventsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EventsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MixedFileDirectory User Events Metadata
<details><summary><code>client.mixedFileDirectory.user.events.metadata.<a href="/src/api/resources/mixedFileDirectory/resources/user/resources/events/resources/metadata/client/Client.ts">getMetadata</a>({ ...params }) -> SeedApi.UsereventsMetadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get event metadata.
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
await client.mixedFileDirectory.user.events.metadata.getMetadata({
    id: "id"
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

**request:** `SeedApi.mixedFileDirectory.user.events.GetMetadataMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MetadataClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironmentReference Items
<details><summary><code>client.multiUrlEnvironmentReference.items.<a href="/src/api/resources/multiUrlEnvironmentReference/resources/items/client/Client.ts">listItems</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironmentReference.items.listItems();

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

**requestOptions:** `ItemsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironmentReference Auth
<details><summary><code>client.multiUrlEnvironmentReference.auth.<a href="/src/api/resources/multiUrlEnvironmentReference/resources/auth/client/Client.ts">gettoken</a>({ ...params }) -> SeedApi.AuthGetTokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironmentReference.auth.gettoken({
    client_id: "client_id",
    client_secret: "client_secret"
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

**request:** `SeedApi.multiUrlEnvironmentReference.AuthGetTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironmentReference Files
<details><summary><code>client.multiUrlEnvironmentReference.files.<a href="/src/api/resources/multiUrlEnvironmentReference/resources/files/client/Client.ts">upload</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironmentReference.files.upload({
    name: "name",
    parent_id: "parent_id"
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

**request:** `SeedApi.multiUrlEnvironmentReference.FilesUploadRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FilesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiLineDocs User
<details><summary><code>client.multiLineDocs.user.<a href="/src/api/resources/multiLineDocs/resources/user/client/Client.ts">getUser</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a user.
This endpoint is used to retrieve a user.
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
await client.multiLineDocs.user.getUser({
    userId: "userId"
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

**request:** `SeedApi.multiLineDocs.GetUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.multiLineDocs.user.<a href="/src/api/resources/multiLineDocs/resources/user/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user.
This endpoint is used to create a new user.
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
await client.multiLineDocs.user.createUser({
    name: "name"
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

**request:** `SeedApi.multiLineDocs.CreateUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironment Ec2
<details><summary><code>client.multiUrlEnvironment.ec2.<a href="/src/api/resources/multiUrlEnvironment/resources/ec2/client/Client.ts">bootInstance</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironment.ec2.bootInstance({
    size: "size"
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

**request:** `SeedApi.multiUrlEnvironment.BootInstanceEc2Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Ec2Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironment S3
<details><summary><code>client.multiUrlEnvironment.s3.<a href="/src/api/resources/multiUrlEnvironment/resources/s3/client/Client.ts">getPresignedUrl</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironment.s3.getPresignedUrl({
    s3Key: "s3Key"
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

**request:** `SeedApi.multiUrlEnvironment.GetPresignedUrlS3Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `S3Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironmentNoDefault Ec2
<details><summary><code>client.multiUrlEnvironmentNoDefault.ec2.<a href="/src/api/resources/multiUrlEnvironmentNoDefault/resources/ec2/client/Client.ts">bootInstance</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironmentNoDefault.ec2.bootInstance({
    size: "size"
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

**request:** `SeedApi.multiUrlEnvironmentNoDefault.BootInstanceEc2Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Ec2Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultiUrlEnvironmentNoDefault S3
<details><summary><code>client.multiUrlEnvironmentNoDefault.s3.<a href="/src/api/resources/multiUrlEnvironmentNoDefault/resources/s3/client/Client.ts">getPresignedUrl</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multiUrlEnvironmentNoDefault.s3.getPresignedUrl({
    s3Key: "s3Key"
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

**request:** `SeedApi.multiUrlEnvironmentNoDefault.GetPresignedUrlS3Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `S3Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipleRequestBodies MultipleRequestBodies
<details><summary><code>client.multipleRequestBodies.multipleRequestBodies.<a href="/src/api/resources/multipleRequestBodies/resources/multipleRequestBodies/client/Client.ts">uploadJsonDocument</a>({ ...params }) -> SeedApi.UploadDocumentResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.multipleRequestBodies.multipleRequestBodies.uploadJsonDocument();

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

**request:** `SeedApi.multipleRequestBodies.UploadJsonDocumentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MultipleRequestBodiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoContentResponse Contacts
<details><summary><code>client.noContentResponse.contacts.<a href="/src/api/resources/noContentResponse/resources/contacts/client/Client.ts">create</a>({ ...params }) -> SeedApi.Contact | undefined</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new contact. Returns 200 with the contact or 204 with no content.
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
await client.noContentResponse.contacts.create({
    name: "name"
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

**request:** `SeedApi.noContentResponse.CreateContactRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noContentResponse.contacts.<a href="/src/api/resources/noContentResponse/resources/contacts/client/Client.ts">get</a>({ ...params }) -> SeedApi.Contact</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a contact by ID. Returns 200 with the contact.
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
await client.noContentResponse.contacts.get({
    id: "id"
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

**request:** `SeedApi.noContentResponse.GetContactsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoEnvironment Dummy
<details><summary><code>client.noEnvironment.dummy.<a href="/src/api/resources/noEnvironment/resources/dummy/client/Client.ts">getDummy</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noEnvironment.dummy.getDummy();

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

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoRetries Retries
<details><summary><code>client.noRetries.retries.<a href="/src/api/resources/noRetries/resources/retries/client/Client.ts">getUsers</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noRetries.retries.getUsers();

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

**requestOptions:** `RetriesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NullType Conversations
<details><summary><code>client.nullType.conversations.<a href="/src/api/resources/nullType/resources/conversations/client/Client.ts">outboundCall</a>({ ...params }) -> SeedApi.OutboundCallConversationsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Place an outbound call or validate call setup with dry_run.
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
await client.nullType.conversations.outboundCall({
    to_phone_number: "to_phone_number"
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

**request:** `SeedApi.nullType.OutboundCallConversationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ConversationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NullType Users
<details><summary><code>client.nullType.users.<a href="/src/api/resources/nullType/resources/users/client/Client.ts">get</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a user by ID. The deleted_at field uses type null.
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
await client.nullType.users.get({
    id: "id"
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

**request:** `SeedApi.nullType.GetUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nullable Nullable
<details><summary><code>client.nullable.nullable.<a href="/src/api/resources/nullable/resources/nullable/client/Client.ts">getUsers</a>({ ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.nullable.getUsers();

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

**request:** `SeedApi.nullable.GetUsersNullableRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.nullable.<a href="/src/api/resources/nullable/resources/nullable/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.nullable.createUser({
    username: "username"
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

**request:** `SeedApi.nullable.CreateUserNullableRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.nullable.<a href="/src/api/resources/nullable/resources/nullable/client/Client.ts">deleteUser</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.nullable.deleteUser();

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

**request:** `SeedApi.nullable.DeleteUserNullableRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NullableAllofExtends
<details><summary><code>client.nullableAllofExtends.<a href="/src/api/resources/nullableAllofExtends/client/Client.ts">getTest</a>() -> SeedApi.RootObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a RootObject which inherits from a nullable schema.
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
await client.nullableAllofExtends.getTest();

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

**requestOptions:** `NullableAllofExtendsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableAllofExtends.<a href="/src/api/resources/nullableAllofExtends/client/Client.ts">createTest</a>({ ...params }) -> SeedApi.RootObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a test object with nullable allOf in request body.
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
await client.nullableAllofExtends.createTest({});

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

**request:** `SeedApi.RootObject` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableAllofExtendsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NullableOptional NullableOptional
<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
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
await client.nullableOptional.nullableOptional.getUser({
    userId: "userId"
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

**request:** `SeedApi.nullableOptional.GetUserNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">updateUser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user (partial update)
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
await client.nullableOptional.nullableOptional.updateUser({
    userId: "userId"
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

**request:** `SeedApi.nullableOptional.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">listUsers</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users
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
await client.nullableOptional.nullableOptional.listUsers();

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

**request:** `SeedApi.nullableOptional.ListUsersNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
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
await client.nullableOptional.nullableOptional.createUser({
    username: "username"
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

**request:** `SeedApi.nullableOptional.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">searchUsers</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search users
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
await client.nullableOptional.nullableOptional.searchUsers({
    query: "query",
    department: "department"
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

**request:** `SeedApi.nullableOptional.SearchUsersNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">createComplexProfile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a complex profile to test nullable enums and unions
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
await client.nullableOptional.nullableOptional.createComplexProfile({
    id: "id"
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

**request:** `SeedApi.ComplexProfile` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">getComplexProfile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a complex profile by ID
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
await client.nullableOptional.nullableOptional.getComplexProfile({
    profileId: "profileId"
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

**request:** `SeedApi.nullableOptional.GetComplexProfileNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">updateComplexProfile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update complex profile to test nullable field updates
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
await client.nullableOptional.nullableOptional.updateComplexProfile({
    profileId: "profileId"
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

**request:** `SeedApi.nullableOptional.UpdateComplexProfileNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">testDeserialization</a>({ ...params }) -> SeedApi.DeserializationTestResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for validating null deserialization
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
await client.nullableOptional.nullableOptional.testDeserialization({
    requiredString: "requiredString"
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

**request:** `SeedApi.DeserializationTestRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">filterByRole</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Filter users by role with nullable enum
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
await client.nullableOptional.nullableOptional.filterByRole({
    role: "ADMIN"
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

**request:** `SeedApi.nullableOptional.FilterByRoleNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">getNotificationSettings</a>({ ...params }) -> SeedApi.NotificationMethod | null</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get notification settings which may be null
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
await client.nullableOptional.nullableOptional.getNotificationSettings({
    userId: "userId"
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

**request:** `SeedApi.nullableOptional.GetNotificationSettingsNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">updateTags</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update tags to test array handling
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
await client.nullableOptional.nullableOptional.updateTags({
    userId: "userId"
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

**request:** `SeedApi.nullableOptional.UpdateTagsNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.nullableOptional.<a href="/src/api/resources/nullableOptional/resources/nullableOptional/client/Client.ts">getSearchResults</a>({ ...params }) -> SeedApi.SearchResult[] | null</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get search results with nullable unions
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
await client.nullableOptional.nullableOptional.getSearchResults({
    query: "query"
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

**request:** `SeedApi.nullableOptional.GetSearchResultsNullableOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NullableRequestBody TestGroup
<details><summary><code>client.nullableRequestBody.testGroup.<a href="/src/api/resources/nullableRequestBody/resources/testGroup/client/Client.ts">testMethodName</a>({ ...params }) -> unknown</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Post a nullable request body
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
await client.nullableRequestBody.testGroup.testMethodName({
    path_param: "path_param",
    body: {}
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

**request:** `SeedApi.nullableRequestBody.TestMethodNameTestGroupRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TestGroupClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentials Auth
<details><summary><code>client.oauthClientCredentials.auth.<a href="/src/api/resources/oauthClientCredentials/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentials.auth.getTokenWithClientCredentials({
    client_id: "my_oauth_app_123",
    client_secret: "sk_live_abcdef123456789",
    audience: "https://api.example.com",
    grant_type: "client_credentials",
    scope: "read:users"
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

**request:** `SeedApi.oauthClientCredentials.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentials.auth.<a href="/src/api/resources/oauthClientCredentials/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentials.auth.refreshToken({
    client_id: "my_oauth_app_123",
    client_secret: "sk_live_abcdef123456789",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token",
    scope: "read:users"
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

**request:** `SeedApi.oauthClientCredentials.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentials NestedNoAuthApi
<details><summary><code>client.oauthClientCredentials.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentials/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentials.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentials NestedApi
<details><summary><code>client.oauthClientCredentials.nestedApi.<a href="/src/api/resources/oauthClientCredentials/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentials.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentials Simple
<details><summary><code>client.oauthClientCredentials.simple.<a href="/src/api/resources/oauthClientCredentials/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentials.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsCustom Auth
<details><summary><code>client.oauthClientCredentialsCustom.auth.<a href="/src/api/resources/oauthClientCredentialsCustom/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsCustom.auth.getTokenWithClientCredentials({
    cid: "cid",
    csr: "csr",
    scp: "scp",
    entity_id: "entity_id",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.oauthClientCredentialsCustom.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentialsCustom.auth.<a href="/src/api/resources/oauthClientCredentialsCustom/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsCustom.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.oauthClientCredentialsCustom.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsCustom NestedNoAuthApi
<details><summary><code>client.oauthClientCredentialsCustom.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentialsCustom/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsCustom.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsCustom NestedApi
<details><summary><code>client.oauthClientCredentialsCustom.nestedApi.<a href="/src/api/resources/oauthClientCredentialsCustom/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsCustom.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsCustom Simple
<details><summary><code>client.oauthClientCredentialsCustom.simple.<a href="/src/api/resources/oauthClientCredentialsCustom/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsCustom.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsDefault Auth
<details><summary><code>client.oauthClientCredentialsDefault.auth.<a href="/src/api/resources/oauthClientCredentialsDefault/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsDefault.auth.getToken({
    client_id: "client_id",
    client_secret: "client_secret",
    grant_type: "client_credentials"
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

**request:** `SeedApi.oauthClientCredentialsDefault.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsDefault NestedNoAuthApi
<details><summary><code>client.oauthClientCredentialsDefault.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentialsDefault/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsDefault.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsDefault NestedApi
<details><summary><code>client.oauthClientCredentialsDefault.nestedApi.<a href="/src/api/resources/oauthClientCredentialsDefault/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsDefault.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsDefault Simple
<details><summary><code>client.oauthClientCredentialsDefault.simple.<a href="/src/api/resources/oauthClientCredentialsDefault/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsDefault.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsEnvironmentVariables Auth
<details><summary><code>client.oauthClientCredentialsEnvironmentVariables.auth.<a href="/src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsEnvironmentVariables.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.oauthClientCredentialsEnvironmentVariables.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentialsEnvironmentVariables.auth.<a href="/src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsEnvironmentVariables.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.oauthClientCredentialsEnvironmentVariables.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsEnvironmentVariables NestedNoAuthApi
<details><summary><code>client.oauthClientCredentialsEnvironmentVariables.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsEnvironmentVariables.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsEnvironmentVariables NestedApi
<details><summary><code>client.oauthClientCredentialsEnvironmentVariables.nestedApi.<a href="/src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsEnvironmentVariables.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsEnvironmentVariables Simple
<details><summary><code>client.oauthClientCredentialsEnvironmentVariables.simple.<a href="/src/api/resources/oauthClientCredentialsEnvironmentVariables/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsEnvironmentVariables.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsMandatoryAuth Auth
<details><summary><code>client.oauthClientCredentialsMandatoryAuth.auth.<a href="/src/api/resources/oauthClientCredentialsMandatoryAuth/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsMandatoryAuth.auth.getTokenWithClientCredentials({
    client_id: "my_oauth_app_123",
    client_secret: "sk_live_abcdef123456789",
    audience: "https://api.example.com",
    grant_type: "client_credentials",
    scope: "read:users"
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

**request:** `SeedApi.oauthClientCredentialsMandatoryAuth.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentialsMandatoryAuth.auth.<a href="/src/api/resources/oauthClientCredentialsMandatoryAuth/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsMandatoryAuth.auth.refreshToken({
    client_id: "my_oauth_app_123",
    client_secret: "sk_live_abcdef123456789",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token",
    scope: "read:users"
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

**request:** `SeedApi.oauthClientCredentialsMandatoryAuth.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsMandatoryAuth NestedApi
<details><summary><code>client.oauthClientCredentialsMandatoryAuth.nestedApi.<a href="/src/api/resources/oauthClientCredentialsMandatoryAuth/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsMandatoryAuth.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsMandatoryAuth Simple
<details><summary><code>client.oauthClientCredentialsMandatoryAuth.simple.<a href="/src/api/resources/oauthClientCredentialsMandatoryAuth/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsMandatoryAuth.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsNestedRoot Auth
<details><summary><code>client.oauthClientCredentialsNestedRoot.auth.<a href="/src/api/resources/oauthClientCredentialsNestedRoot/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.AuthTokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsNestedRoot.auth.getToken({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.oauthClientCredentialsNestedRoot.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsNestedRoot NestedNoAuthApi
<details><summary><code>client.oauthClientCredentialsNestedRoot.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentialsNestedRoot/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsNestedRoot.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsNestedRoot NestedApi
<details><summary><code>client.oauthClientCredentialsNestedRoot.nestedApi.<a href="/src/api/resources/oauthClientCredentialsNestedRoot/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsNestedRoot.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsNestedRoot Simple
<details><summary><code>client.oauthClientCredentialsNestedRoot.simple.<a href="/src/api/resources/oauthClientCredentialsNestedRoot/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsNestedRoot.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsOpenapi Identity
<details><summary><code>client.oauthClientCredentialsOpenapi.identity.<a href="/src/api/resources/oauthClientCredentialsOpenapi/resources/identity/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsOpenapi.identity.getToken({
    username: "username",
    password: "password"
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

**request:** `SeedApi.oauthClientCredentialsOpenapi.GetTokenIdentityRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `IdentityClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsOpenapi Plants
<details><summary><code>client.oauthClientCredentialsOpenapi.plants.<a href="/src/api/resources/oauthClientCredentialsOpenapi/resources/plants/client/Client.ts">list</a>() -> SeedApi.Plant[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsOpenapi.plants.list();

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

**requestOptions:** `PlantsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentialsOpenapi.plants.<a href="/src/api/resources/oauthClientCredentialsOpenapi/resources/plants/client/Client.ts">get</a>({ ...params }) -> SeedApi.Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsOpenapi.plants.get({
    plantId: "plantId"
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

**request:** `SeedApi.oauthClientCredentialsOpenapi.GetPlantsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlantsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsReference Auth
<details><summary><code>client.oauthClientCredentialsReference.auth.<a href="/src/api/resources/oauthClientCredentialsReference/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsReference.auth.getToken({
    client_id: "client_id",
    client_secret: "client_secret"
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

**request:** `SeedApi.oauthClientCredentialsReference.GetTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsReference Simple
<details><summary><code>client.oauthClientCredentialsReference.simple.<a href="/src/api/resources/oauthClientCredentialsReference/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsReference.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsWithVariables Auth
<details><summary><code>client.oauthClientCredentialsWithVariables.auth.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.oauthClientCredentialsWithVariables.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.oauthClientCredentialsWithVariables.auth.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.oauthClientCredentialsWithVariables.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsWithVariables NestedNoAuthApi
<details><summary><code>client.oauthClientCredentialsWithVariables.nestedNoAuthApi.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/nestedNoAuthApi/client/Client.ts">nestedNoAuthApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.nestedNoAuthApi.nestedNoAuthApiGetSomething();

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

**requestOptions:** `NestedNoAuthApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsWithVariables NestedApi
<details><summary><code>client.oauthClientCredentialsWithVariables.nestedApi.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/nestedApi/client/Client.ts">nestedApiGetSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.nestedApi.nestedApiGetSomething();

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

**requestOptions:** `NestedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsWithVariables Service
<details><summary><code>client.oauthClientCredentialsWithVariables.service.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/service/client/Client.ts">post</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.service.post({
    endpointParam: "endpointParam"
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

**request:** `SeedApi.oauthClientCredentialsWithVariables.PostServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OauthClientCredentialsWithVariables Simple
<details><summary><code>client.oauthClientCredentialsWithVariables.simple.<a href="/src/api/resources/oauthClientCredentialsWithVariables/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauthClientCredentialsWithVariables.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OpenapiRequestBodyRef Vendor
<details><summary><code>client.openapiRequestBodyRef.vendor.<a href="/src/api/resources/openapiRequestBodyRef/resources/vendor/client/Client.ts">updateVendor</a>({ ...params }) -> SeedApi.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.openapiRequestBodyRef.vendor.updateVendor({
    vendor_id: "vendor_id",
    body: {
        name: "name"
    }
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

**request:** `SeedApi.openapiRequestBodyRef.UpdateVendorBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VendorClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.openapiRequestBodyRef.vendor.<a href="/src/api/resources/openapiRequestBodyRef/resources/vendor/client/Client.ts">createVendor</a>({ ...params }) -> SeedApi.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.openapiRequestBodyRef.vendor.createVendor({
    name: "name"
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

**request:** `SeedApi.openapiRequestBodyRef.CreateVendorRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VendorClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OpenapiRequestBodyRef Catalog
<details><summary><code>client.openapiRequestBodyRef.catalog.<a href="/src/api/resources/openapiRequestBodyRef/resources/catalog/client/Client.ts">createCatalogImage</a>({ ...params }) -> SeedApi.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.openapiRequestBodyRef.catalog.createCatalogImage({
    request: {
        catalog_object_id: "catalog_object_id"
    }
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

**request:** `SeedApi.openapiRequestBodyRef.CreateCatalogImageBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CatalogClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.openapiRequestBodyRef.catalog.<a href="/src/api/resources/openapiRequestBodyRef/resources/catalog/client/Client.ts">getCatalogImage</a>({ ...params }) -> SeedApi.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.openapiRequestBodyRef.catalog.getCatalogImage({
    image_id: "image_id"
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

**request:** `SeedApi.openapiRequestBodyRef.GetCatalogImageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CatalogClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## OpenapiRequestBodyRef TeamMember
<details><summary><code>client.openapiRequestBodyRef.teamMember.<a href="/src/api/resources/openapiRequestBodyRef/resources/teamMember/client/Client.ts">updateTeamMember</a>({ ...params }) -> SeedApi.TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.openapiRequestBodyRef.teamMember.updateTeamMember({
    team_member_id: "team_member_id"
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

**request:** `SeedApi.openapiRequestBodyRef.UpdateTeamMemberRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TeamMemberClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Optional Optional
<details><summary><code>client.optional.optional.<a href="/src/api/resources/optional/resources/optional/client/Client.ts">sendOptionalBody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.optional.sendOptionalBody({
    "key": "value"
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

**request:** `Record<string, unknown> | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.optional.<a href="/src/api/resources/optional/resources/optional/client/Client.ts">sendOptionalTypedBody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.optional.sendOptionalTypedBody({
    message: "message"
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

**request:** `SeedApi.SendOptionalBodyRequest | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.optional.<a href="/src/api/resources/optional/resources/optional/client/Client.ts">sendOptionalNullableWithAllOptionalProperties</a>({ ...params }) -> SeedApi.DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
await client.optional.optional.sendOptionalNullableWithAllOptionalProperties({
    actionId: "actionId",
    id: "id",
    body: {}
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

**request:** `SeedApi.optional.SendOptionalNullableWithAllOptionalPropertiesOptionalRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pagination Complex
<details><summary><code>client.pagination.complex.<a href="/src/api/resources/pagination/resources/complex/client/Client.ts">search</a>({ ...params }) -> SeedApi.PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.complex.search({
    index: "index",
    query: {}
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

**request:** `SeedApi.pagination.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ComplexClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pagination Users
<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithCursorPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithCursorPagination();

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

**request:** `SeedApi.pagination.ListWithCursorPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithMixedTypeCursorPagination</a>({ ...params }) -> SeedApi.ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithMixedTypeCursorPagination();

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

**request:** `SeedApi.pagination.ListWithMixedTypeCursorPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithBodyCursorPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithBodyCursorPagination();

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

**request:** `SeedApi.pagination.ListWithBodyCursorPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithTopLevelBodyCursorPagination</a>({ ...params }) -> SeedApi.ListUsersTopLevelCursorPaginationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level cursor field in the request body.
This tests that the mock server correctly ignores cursor mismatches
when getNextPage() is called with a different cursor value.
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
await client.pagination.users.listWithTopLevelBodyCursorPagination({
    cursor: "initial_cursor",
    filter: "active"
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

**request:** `SeedApi.pagination.ListWithTopLevelBodyCursorPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithOffsetPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithOffsetPagination();

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

**request:** `SeedApi.pagination.ListWithOffsetPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithDoubleOffsetPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithDoubleOffsetPagination();

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

**request:** `SeedApi.pagination.ListWithDoubleOffsetPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithBodyOffsetPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithBodyOffsetPagination();

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

**request:** `SeedApi.pagination.ListWithBodyOffsetPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithOffsetStepPagination</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithOffsetStepPagination();

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

**request:** `SeedApi.pagination.ListWithOffsetStepPaginationUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithOffsetPaginationHasNextPage</a>({ ...params }) -> SeedApi.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithOffsetPaginationHasNextPage();

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

**request:** `SeedApi.pagination.ListWithOffsetPaginationHasNextPageUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithExtendedResults</a>({ ...params }) -> SeedApi.ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithExtendedResults();

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

**request:** `SeedApi.pagination.ListWithExtendedResultsUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithExtendedResultsAndOptionalData</a>({ ...params }) -> SeedApi.ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithExtendedResultsAndOptionalData();

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

**request:** `SeedApi.pagination.ListWithExtendedResultsAndOptionalDataUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listUsernames</a>({ ...params }) -> SeedApi.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listUsernames();

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

**request:** `SeedApi.pagination.ListUsernamesUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listUsernamesWithOptionalResponse</a>({ ...params }) -> SeedApi.UsernameCursor | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listUsernamesWithOptionalResponse();

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

**request:** `SeedApi.pagination.ListUsernamesWithOptionalResponseUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> SeedApi.UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithGlobalConfig();

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

**request:** `SeedApi.pagination.ListWithGlobalConfigUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithOptionalData</a>({ ...params }) -> SeedApi.ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithOptionalData();

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

**request:** `SeedApi.pagination.ListWithOptionalDataUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.users.<a href="/src/api/resources/pagination/resources/users/client/Client.ts">listWithAliasedData</a>({ ...params }) -> SeedApi.ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.users.listWithAliasedData();

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

**request:** `SeedApi.pagination.ListWithAliasedDataUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pagination InlineUsers InlineUsers
<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithCursorPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithCursorPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithCursorPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithMixedTypeCursorPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithMixedTypeCursorPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithBodyCursorPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithBodyCursorPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithBodyCursorPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithOffsetPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithOffsetPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithDoubleOffsetPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithDoubleOffsetPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithDoubleOffsetPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithBodyOffsetPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithBodyOffsetPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithBodyOffsetPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetStepPagination</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithOffsetStepPagination();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithOffsetStepPaginationInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetPaginationHasNextPage</a>({ ...params }) -> SeedApi.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithOffsetPaginationHasNextPageInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithExtendedResults</a>({ ...params }) -> SeedApi.InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithExtendedResults();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithExtendedResultsInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithExtendedResultsAndOptionalData</a>({ ...params }) -> SeedApi.InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithExtendedResultsAndOptionalDataInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listUsernames</a>({ ...params }) -> SeedApi.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listUsernames();

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

**request:** `SeedApi.pagination.inlineUsers.ListUsernamesInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pagination.inlineUsers.inlineUsers.<a href="/src/api/resources/pagination/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> SeedApi.InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pagination.inlineUsers.inlineUsers.listWithGlobalConfig();

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

**request:** `SeedApi.pagination.inlineUsers.ListWithGlobalConfigInlineUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PaginationCustom Users
<details><summary><code>client.paginationCustom.users.<a href="/src/api/resources/paginationCustom/resources/users/client/Client.ts">listWithCustomPager</a>({ ...params }) -> SeedApi.UsersListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.paginationCustom.users.listWithCustomPager();

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

**request:** `SeedApi.paginationCustom.ListWithCustomPagerUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PaginationUriPath Users
<details><summary><code>client.paginationUriPath.users.<a href="/src/api/resources/paginationUriPath/resources/users/client/Client.ts">listWithUriPagination</a>() -> SeedApi.ListUsersUriPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.paginationUriPath.users.listWithUriPagination();

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

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paginationUriPath.users.<a href="/src/api/resources/paginationUriPath/resources/users/client/Client.ts">listWithPathPagination</a>() -> SeedApi.ListUsersPathPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.paginationUriPath.users.listWithPathPagination();

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

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PathParameters Organizations
<details><summary><code>client.pathParameters.organizations.<a href="/src/api/resources/pathParameters/resources/organizations/client/Client.ts">getOrganization</a>({ ...params }) -> SeedApi.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.organizations.getOrganization({
    tenant_id: "tenant_id",
    organization_id: "organization_id"
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

**request:** `SeedApi.pathParameters.GetOrganizationOrganizationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.organizations.<a href="/src/api/resources/pathParameters/resources/organizations/client/Client.ts">getOrganizationUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.organizations.getOrganizationUser({
    tenant_id: "tenant_id",
    organization_id: "organization_id",
    user_id: "user_id"
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

**request:** `SeedApi.pathParameters.GetOrganizationUserOrganizationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.organizations.<a href="/src/api/resources/pathParameters/resources/organizations/client/Client.ts">searchOrganizations</a>({ ...params }) -> SeedApi.Organization[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.organizations.searchOrganizations({
    tenant_id: "tenant_id",
    organization_id: "organization_id"
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

**request:** `SeedApi.pathParameters.SearchOrganizationsOrganizationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PathParameters User
<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.user.getUser({
    tenant_id: "tenant_id",
    user_id: "user_id"
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

**request:** `SeedApi.pathParameters.GetUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">updateUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.user.updateUser({
    tenant_id: "tenant_id",
    user_id: "user_id",
    body: {
        name: "name",
        tags: ["tags"]
    }
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

**request:** `SeedApi.pathParameters.UpdateUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.user.createUser({
    tenant_id: "tenant_id",
    body: {
        name: "name",
        tags: ["tags"]
    }
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

**request:** `SeedApi.pathParameters.CreateUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">searchUsers</a>({ ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParameters.user.searchUsers({
    tenant_id: "tenant_id",
    user_id: "user_id"
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

**request:** `SeedApi.pathParameters.SearchUsersUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">getUserMetadata</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
await client.pathParameters.user.getUserMetadata({
    tenant_id: "tenant_id",
    user_id: "user_id",
    version: 1
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

**request:** `SeedApi.pathParameters.GetUserMetadataUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.pathParameters.user.<a href="/src/api/resources/pathParameters/resources/user/client/Client.ts">getUserSpecifics</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
await client.pathParameters.user.getUserSpecifics({
    tenant_id: "tenant_id",
    user_id: "user_id",
    version: 1,
    thought: "thought"
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

**request:** `SeedApi.pathParameters.GetUserSpecificsUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PlainText Service
<details><summary><code>client.plainText.service.<a href="/src/api/resources/plainText/resources/service/client/Client.ts">getText</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plainText.service.getText();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PropertyAccess PropertyAccess
<details><summary><code>client.propertyAccess.propertyAccess.<a href="/src/api/resources/propertyAccess/resources/propertyAccess/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.propertyAccess.propertyAccess.createUser({
    id: "id",
    email: "email",
    password: "password",
    profile: {
        name: "name",
        verification: {
            verified: "verified"
        },
        ssn: "ssn"
    }
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

**request:** `SeedApi.User` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PropertyAccessClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PublicObject Service
<details><summary><code>client.publicObject.service.<a href="/src/api/resources/publicObject/resources/service/client/Client.ts">get</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.publicObject.service.get();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PythonPositionalSingleProperty PythonPositionalSingleProperty
<details><summary><code>client.pythonPositionalSingleProperty.pythonPositionalSingleProperty.<a href="/src/api/resources/pythonPositionalSingleProperty/resources/pythonPositionalSingleProperty/client/Client.ts">create</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pythonPositionalSingleProperty.pythonPositionalSingleProperty.create({
    instrument: {
        identifier: {
            isin: "US0378331005"
        },
        quantity: {
            quantity: 10000,
            type: "QUANTITY"
        }
    },
    taker: {
        trader: {
            uuid_: 1234567
        }
    }
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

**request:** `SeedApi.pythonPositionalSingleProperty.CreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PythonPositionalSinglePropertyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PythonBackslashEscape User
<details><summary><code>client.pythonBackslashEscape.user.<a href="/src/api/resources/pythonBackslashEscape/resources/user/client/Client.ts">get</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by their ID.
For Windows authentication, use DOMAIN\username format.
Other backslash examples: FOO\_BAR, path\to\file, C:\Users\name
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
await client.pythonBackslashEscape.user.get({
    id: "id"
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

**request:** `SeedApi.pythonBackslashEscape.GetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PythonReservedKeywordSubpackages Class
<details><summary><code>client.pythonReservedKeywordSubpackages.class.<a href="/src/api/resources/pythonReservedKeywordSubpackages/resources/class/client/Client.ts">create</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pythonReservedKeywordSubpackages.class.create();

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

**requestOptions:** `ClassClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PythonReservedKeywordSubpackages Automations Import
<details><summary><code>client.pythonReservedKeywordSubpackages.automations.import.<a href="/src/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/import/client/Client.ts">create</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pythonReservedKeywordSubpackages.automations.import.create();

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

**requestOptions:** `ImportClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PythonReservedKeywordSubpackages Automations Export
<details><summary><code>client.pythonReservedKeywordSubpackages.automations.export.<a href="/src/api/resources/pythonReservedKeywordSubpackages/resources/automations/resources/export/client/Client.ts">create</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pythonReservedKeywordSubpackages.automations.export.create();

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

**requestOptions:** `ExportClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParametersOpenapi
<details><summary><code>client.queryParametersOpenapi.<a href="/src/api/resources/queryParametersOpenapi/client/Client.ts">search</a>({ ...params }) -> SeedApi.SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.queryParametersOpenapi.search({
    limit: 1,
    id: "id",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    userList: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        "keyValue": "keyValue"
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter",
    tags: "tags",
    optionalTags: "optionalTags",
    neighbor: {
        name: "name",
        tags: ["tags", "tags"]
    },
    neighborRequired: {
        name: "name",
        tags: ["tags", "tags"]
    }
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

**request:** `SeedApi.queryParametersOpenapi.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryParametersOpenapiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParameters User
<details><summary><code>client.queryParameters.user.<a href="/src/api/resources/queryParameters/resources/user/client/Client.ts">getUsername</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.queryParameters.user.getUsername({
    limit: 1,
    id: "id",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    userList: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        "keyValue": "keyValue"
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter"
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

**request:** `SeedApi.queryParameters.GetUsernameUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## RequestParameters User
<details><summary><code>client.requestParameters.user.<a href="/src/api/resources/requestParameters/resources/user/client/Client.ts">createUsername</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requestParameters.user.createUsername({
    tags: ["tags"],
    username: "username",
    password: "password",
    name: "name"
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

**request:** `SeedApi.requestParameters.CreateUsernameUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.requestParameters.user.<a href="/src/api/resources/requestParameters/resources/user/client/Client.ts">createUsernameWithReferencedType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requestParameters.user.createUsernameWithReferencedType({
    tags: ["tags"],
    username: "username",
    password: "password",
    name: "name"
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

**request:** `SeedApi.requestParameters.CreateUsernameBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.requestParameters.user.<a href="/src/api/resources/requestParameters/resources/user/client/Client.ts">createUsernameOptional</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requestParameters.user.createUsernameOptional({});

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

**request:** `SeedApi.CreateUsernameBodyOptionalProperties | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.requestParameters.user.<a href="/src/api/resources/requestParameters/resources/user/client/Client.ts">getUsername</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requestParameters.user.getUsername({
    limit: 1,
    id: "id",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    userList: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        "keyValue": "keyValue"
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter",
    longParam: 1000000,
    bigIntParam: 1
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

**request:** `SeedApi.requestParameters.GetUsernameUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## RequiredNullable RequiredNullable
<details><summary><code>client.requiredNullable.requiredNullable.<a href="/src/api/resources/requiredNullable/resources/requiredNullable/client/Client.ts">getFoo</a>({ ...params }) -> SeedApi.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requiredNullable.requiredNullable.getFoo({
    required_baz: "required_baz",
    required_nullable_baz: "required_nullable_baz"
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

**request:** `SeedApi.requiredNullable.GetFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequiredNullableClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.requiredNullable.requiredNullable.<a href="/src/api/resources/requiredNullable/resources/requiredNullable/client/Client.ts">updateFoo</a>({ ...params }) -> SeedApi.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requiredNullable.requiredNullable.updateFoo({
    idempotencyKey: "X-Idempotency-Key",
    id: "id"
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

**request:** `SeedApi.requiredNullable.UpdateFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequiredNullableClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReservedKeywords Package
<details><summary><code>client.reservedKeywords.package.<a href="/src/api/resources/reservedKeywords/resources/package/client/Client.ts">test</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.reservedKeywords.package.test({
    "for": "for"
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

**request:** `SeedApi.reservedKeywords.TestPackageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PackageClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ResponseProperty Service
<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getMovie</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getMovie("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getMovieDocs</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getMovieDocs("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getMovieName</a>({ ...params }) -> SeedApi.StringResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getMovieName("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getMovieMetadata</a>({ ...params }) -> SeedApi.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getMovieMetadata("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getOptionalMovie</a>({ ...params }) -> SeedApi.Response | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getOptionalMovie("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getOptionalMovieDocs</a>({ ...params }) -> SeedApi.OptionalWithDocs | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getOptionalMovieDocs("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.responseProperty.service.<a href="/src/api/resources/responseProperty/resources/service/client/Client.ts">getOptionalMovieName</a>({ ...params }) -> SeedApi.OptionalStringResponse | null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.responseProperty.service.getOptionalMovieName("string");

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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## RubyReservedWordProperties Service
<details><summary><code>client.rubyReservedWordProperties.service.<a href="/src/api/resources/rubyReservedWordProperties/resources/service/client/Client.ts">get</a>() -> SeedApi.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.rubyReservedWordProperties.service.get();

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

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## SchemalessRequestBodyExamples
<details><summary><code>client.schemalessRequestBodyExamples.<a href="/src/api/resources/schemalessRequestBodyExamples/client/Client.ts">createPlant</a>({ ...params }) -> SeedApi.CreatePlantResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a plant with example JSON but no request body schema.
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
await client.schemalessRequestBodyExamples.createPlant({
    "name": "Venus Flytrap",
    "species": "Dionaea muscipula",
    "care": {
        "light": "full sun",
        "water": "distilled only",
        "humidity": "high"
    },
    "tags": [
        "carnivorous",
        "tropical"
    ]
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SchemalessRequestBodyExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.schemalessRequestBodyExamples.<a href="/src/api/resources/schemalessRequestBodyExamples/client/Client.ts">updatePlant</a>({ ...params }) -> SeedApi.UpdatePlantResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a plant with example JSON but no request body schema.
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
await client.schemalessRequestBodyExamples.updatePlant({
    plantId: "plantId",
    body: {
        "name": "Updated Venus Flytrap",
        "care": {
            "light": "partial shade"
        }
    }
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

**request:** `SeedApi.schemalessRequestBodyExamples.UpdatePlantRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SchemalessRequestBodyExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.schemalessRequestBodyExamples.<a href="/src/api/resources/schemalessRequestBodyExamples/client/Client.ts">createPlantWithSchema</a>({ ...params }) -> SeedApi.CreatePlantWithSchemaResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A control endpoint that has both schema and example defined.
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
await client.schemalessRequestBodyExamples.createPlantWithSchema({
    name: "Sundew",
    species: "Drosera capensis"
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

**request:** `SeedApi.schemalessRequestBodyExamples.CreatePlantWithSchemaRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SchemalessRequestBodyExamplesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ServerUrlTemplating
<details><summary><code>client.serverUrlTemplating.<a href="/src/api/resources/serverUrlTemplating/client/Client.ts">getUsers</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverUrlTemplating.getUsers();

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

**requestOptions:** `ServerUrlTemplatingClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverUrlTemplating.<a href="/src/api/resources/serverUrlTemplating/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverUrlTemplating.getUser({
    userId: "userId"
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

**request:** `SeedApi.serverUrlTemplating.GetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServerUrlTemplatingClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverUrlTemplating.<a href="/src/api/resources/serverUrlTemplating/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverUrlTemplating.getToken({
    client_id: "client_id",
    client_secret: "client_secret"
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

**request:** `SeedApi.TokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServerUrlTemplatingClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ServerSentEventExamples Completions
<details><summary><code>client.serverSentEventExamples.completions.<a href="/src/api/resources/serverSentEventExamples/resources/completions/client/Client.ts">stream</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEventExamples.completions.stream({
    query: "foo"
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

**request:** `SeedApi.serverSentEventExamples.StreamCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverSentEventExamples.completions.<a href="/src/api/resources/serverSentEventExamples/resources/completions/client/Client.ts">streamEvents</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEventExamples.completions.streamEvents({
    query: "query"
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

**request:** `SeedApi.serverSentEventExamples.StreamEventsCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverSentEventExamples.completions.<a href="/src/api/resources/serverSentEventExamples/resources/completions/client/Client.ts">streamEventsDiscriminantInData</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEventExamples.completions.streamEventsDiscriminantInData({
    query: "query"
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

**request:** `SeedApi.serverSentEventExamples.StreamEventsDiscriminantInDataCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverSentEventExamples.completions.<a href="/src/api/resources/serverSentEventExamples/resources/completions/client/Client.ts">streamEventsContextProtocol</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEventExamples.completions.streamEventsContextProtocol({
    query: "query"
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

**request:** `SeedApi.serverSentEventExamples.StreamEventsContextProtocolCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ServerSentEvents Completions
<details><summary><code>client.serverSentEvents.completions.<a href="/src/api/resources/serverSentEvents/resources/completions/client/Client.ts">stream</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEvents.completions.stream({
    query: "foo"
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

**request:** `SeedApi.serverSentEvents.StreamCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.serverSentEvents.completions.<a href="/src/api/resources/serverSentEvents/resources/completions/client/Client.ts">streamWithoutTerminator</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.serverSentEvents.completions.streamWithoutTerminator({
    query: "query"
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

**request:** `SeedApi.serverSentEvents.StreamWithoutTerminatorCompletionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## SimpleFhir SimpleFhir
<details><summary><code>client.simpleFhir.simpleFhir.<a href="/src/api/resources/simpleFhir/resources/simpleFhir/client/Client.ts">getAccount</a>({ ...params }) -> SeedApi.Account</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.simpleFhir.simpleFhir.getAccount({
    account_id: "account_id"
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

**request:** `SeedApi.simpleFhir.GetAccountRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SimpleFhirClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## SimpleApi User
<details><summary><code>client.simpleApi.user.<a href="/src/api/resources/simpleApi/resources/user/client/Client.ts">get</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.simpleApi.user.get({
    id: "id"
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

**request:** `SeedApi.simpleApi.GetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## SingleUrlEnvironmentDefault Dummy
<details><summary><code>client.singleUrlEnvironmentDefault.dummy.<a href="/src/api/resources/singleUrlEnvironmentDefault/resources/dummy/client/Client.ts">getDummy</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.singleUrlEnvironmentDefault.dummy.getDummy();

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

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## SingleUrlEnvironmentNoDefault Dummy
<details><summary><code>client.singleUrlEnvironmentNoDefault.dummy.<a href="/src/api/resources/singleUrlEnvironmentNoDefault/resources/dummy/client/Client.ts">getDummy</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.singleUrlEnvironmentNoDefault.dummy.getDummy();

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

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Streaming Dummy
<details><summary><code>client.streaming.dummy.<a href="/src/api/resources/streaming/resources/dummy/client/Client.ts">generateStream</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.streaming.dummy.generateStream({
    stream: true,
    num_events: 1
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

**request:** `SeedApi.streaming.GenerateStreamDummyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.streaming.dummy.<a href="/src/api/resources/streaming/resources/dummy/client/Client.ts">generate</a>({ ...params }) -> SeedApi.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.streaming.dummy.generate({
    stream: false,
    num_events: 5
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

**request:** `SeedApi.streaming.GenerateDummyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## StreamingParameter Dummy
<details><summary><code>client.streamingParameter.dummy.<a href="/src/api/resources/streamingParameter/resources/dummy/client/Client.ts">generate</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.streamingParameter.dummy.generate({
    stream: false,
    num_events: 5
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

**request:** `SeedApi.streamingParameter.GenerateDummyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace V2
<details><summary><code>client.trace.v2.<a href="/src/api/resources/trace/resources/v2/client/Client.ts">test</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.v2.test();

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

**requestOptions:** `V2Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Admin
<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">updateTestSubmissionStatus</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.updateTestSubmissionStatus({
    submissionId: "submissionId",
    body: {
        type: "stopped"
    }
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

**request:** `SeedApi.trace.UpdateTestSubmissionStatusAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">sendTestSubmissionUpdate</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.sendTestSubmissionUpdate({
    submissionId: "submissionId",
    body: {
        updateTime: "2024-01-15T09:30:00Z",
        updateInfo: {
            type: "running"
        }
    }
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

**request:** `SeedApi.trace.SendTestSubmissionUpdateAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">updateWorkspaceSubmissionStatus</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.updateWorkspaceSubmissionStatus({
    submissionId: "submissionId",
    body: {
        type: "stopped"
    }
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

**request:** `SeedApi.trace.UpdateWorkspaceSubmissionStatusAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">sendWorkspaceSubmissionUpdate</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.sendWorkspaceSubmissionUpdate({
    submissionId: "submissionId",
    body: {
        updateTime: "2024-01-15T09:30:00Z",
        updateInfo: {
            type: "running"
        }
    }
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

**request:** `SeedApi.trace.SendWorkspaceSubmissionUpdateAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">storeTracedTestCase</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.storeTracedTestCase({
    submissionId: "submissionId",
    testCaseId: "testCaseId",
    result: {
        result: {
            expectedResult: {
                type: "integerValue"
            },
            actualResult: {
                type: "value"
            },
            passed: true
        },
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "submissionId",
            lineNumber: 1,
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.trace.StoreTracedTestCaseAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">storeTracedTestCaseV2</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.storeTracedTestCaseV2({
    submissionId: "submissionId",
    testCaseId: "testCaseId",
    body: [{
            submissionId: "submissionId",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory"
            },
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.trace.StoreTracedTestCaseV2AdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">storeTracedWorkspace</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.storeTracedWorkspace({
    submissionId: "submissionId",
    workspaceRunDetails: {
        stdout: "stdout"
    },
    traceResponses: [{
            submissionId: "submissionId",
            lineNumber: 1,
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.trace.StoreTracedWorkspaceAdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.admin.<a href="/src/api/resources/trace/resources/admin/client/Client.ts">storeTracedWorkspaceV2</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.admin.storeTracedWorkspaceV2({
    submissionId: "submissionId",
    body: [{
            submissionId: "submissionId",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory"
            },
            stack: {
                numStackFrames: 1
            }
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

**request:** `SeedApi.trace.StoreTracedWorkspaceV2AdminRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AdminClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Homepage
<details><summary><code>client.trace.homepage.<a href="/src/api/resources/trace/resources/homepage/client/Client.ts">getHomepageProblems</a>() -> SeedApi.ProblemId[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.homepage.getHomepageProblems();

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

**requestOptions:** `HomepageClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.homepage.<a href="/src/api/resources/trace/resources/homepage/client/Client.ts">setHomepageProblems</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.homepage.setHomepageProblems(["string"]);

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

**request:** `SeedApi.ProblemId[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HomepageClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Migration
<details><summary><code>client.trace.migration.<a href="/src/api/resources/trace/resources/migration/client/Client.ts">getAttemptedMigrations</a>({ ...params }) -> SeedApi.Migration[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.migration.getAttemptedMigrations({
    adminKeyHeader: "admin-key-header"
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

**request:** `SeedApi.trace.GetAttemptedMigrationsMigrationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MigrationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Playlist
<details><summary><code>client.trace.playlist.<a href="/src/api/resources/trace/resources/playlist/client/Client.ts">createPlaylist</a>({ ...params }) -> SeedApi.Playlist</code></summary>
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

```typescript
await client.trace.playlist.createPlaylist({
    serviceParam: 1,
    datetime: "2024-01-15T09:30:00Z",
    body: {
        name: "name",
        problems: ["problems"]
    }
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

**request:** `SeedApi.trace.CreatePlaylistPlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.playlist.<a href="/src/api/resources/trace/resources/playlist/client/Client.ts">getPlaylists</a>({ ...params }) -> SeedApi.Playlist[]</code></summary>
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

```typescript
await client.trace.playlist.getPlaylists({
    serviceParam: 1,
    otherField: "otherField",
    multiLineDocs: "multiLineDocs",
    multipleField: ["multipleField"]
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

**request:** `SeedApi.trace.GetPlaylistsPlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.playlist.<a href="/src/api/resources/trace/resources/playlist/client/Client.ts">getPlaylist</a>({ ...params }) -> SeedApi.Playlist</code></summary>
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

```typescript
await client.trace.playlist.getPlaylist({
    serviceParam: 1,
    playlistId: "playlistId"
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

**request:** `SeedApi.trace.GetPlaylistPlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.playlist.<a href="/src/api/resources/trace/resources/playlist/client/Client.ts">updatePlaylist</a>({ ...params }) -> SeedApi.Playlist | null</code></summary>
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

```typescript
await client.trace.playlist.updatePlaylist({
    serviceParam: 1,
    playlistId: "playlistId",
    body: {
        name: "name",
        problems: ["problems"]
    }
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

**request:** `SeedApi.trace.UpdatePlaylistPlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.playlist.<a href="/src/api/resources/trace/resources/playlist/client/Client.ts">deletePlaylist</a>({ ...params }) -> void</code></summary>
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

```typescript
await client.trace.playlist.deletePlaylist({
    serviceParam: 1,
    playlist_id: "playlist_id"
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

**request:** `SeedApi.trace.DeletePlaylistPlaylistRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlaylistClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Problem
<details><summary><code>client.trace.problem.<a href="/src/api/resources/trace/resources/problem/client/Client.ts">createProblem</a>({ ...params }) -> SeedApi.CreateProblemResponse</code></summary>
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

```typescript
await client.trace.problem.createProblem({
    problemName: "problemName",
    problemDescription: {
        boards: [{
                type: "html"
            }]
    },
    files: {
        "key": {
            solutionFile: {
                filename: "filename",
                contents: "contents"
            },
            readOnlyFiles: [{
                    filename: "filename",
                    contents: "contents"
                }]
        }
    },
    inputParams: [{
            variableType: {
                type: "integerType"
            },
            name: "name"
        }],
    outputType: {
        type: "integerType"
    },
    testcases: [{
            testCase: {
                id: "id",
                params: [{
                        type: "integerValue"
                    }]
            },
            expectedResult: {
                type: "integerValue"
            }
        }],
    methodName: "methodName"
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

**request:** `SeedApi.CreateProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.problem.<a href="/src/api/resources/trace/resources/problem/client/Client.ts">updateProblem</a>({ ...params }) -> SeedApi.UpdateProblemResponse</code></summary>
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

```typescript
await client.trace.problem.updateProblem({
    problemId: "problemId",
    body: {
        problemName: "problemName",
        problemDescription: {
            boards: [{
                    type: "html"
                }]
        },
        files: {
            "key": {
                solutionFile: {
                    filename: "filename",
                    contents: "contents"
                },
                readOnlyFiles: [{
                        filename: "filename",
                        contents: "contents"
                    }]
            }
        },
        inputParams: [{
                variableType: {
                    type: "integerType"
                },
                name: "name"
            }],
        outputType: {
            type: "integerType"
        },
        testcases: [{
                testCase: {
                    id: "id",
                    params: [{
                            type: "integerValue"
                        }]
                },
                expectedResult: {
                    type: "integerValue"
                }
            }],
        methodName: "methodName"
    }
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

**request:** `SeedApi.trace.UpdateProblemProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.problem.<a href="/src/api/resources/trace/resources/problem/client/Client.ts">deleteProblem</a>({ ...params }) -> void</code></summary>
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

```typescript
await client.trace.problem.deleteProblem({
    problemId: "problemId"
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

**request:** `SeedApi.trace.DeleteProblemProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.problem.<a href="/src/api/resources/trace/resources/problem/client/Client.ts">getDefaultStarterFiles</a>({ ...params }) -> SeedApi.GetDefaultStarterFilesResponse</code></summary>
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

```typescript
await client.trace.problem.getDefaultStarterFiles({
    inputParams: [{
            variableType: {
                type: "integerType"
            },
            name: "name"
        }],
    outputType: {
        type: "integerType"
    },
    methodName: "methodName"
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

**request:** `SeedApi.trace.GetDefaultStarterFilesProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Submission
<details><summary><code>client.trace.submission.<a href="/src/api/resources/trace/resources/submission/client/Client.ts">createExecutionSession</a>({ ...params }) -> SeedApi.ExecutionSessionResponse</code></summary>
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

```typescript
await client.trace.submission.createExecutionSession({
    language: "JAVA"
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

**request:** `SeedApi.trace.CreateExecutionSessionSubmissionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.submission.<a href="/src/api/resources/trace/resources/submission/client/Client.ts">getExecutionSession</a>({ ...params }) -> SeedApi.ExecutionSessionResponse | null</code></summary>
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

```typescript
await client.trace.submission.getExecutionSession({
    sessionId: "sessionId"
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

**request:** `SeedApi.trace.GetExecutionSessionSubmissionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.submission.<a href="/src/api/resources/trace/resources/submission/client/Client.ts">stopExecutionSession</a>({ ...params }) -> void</code></summary>
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

```typescript
await client.trace.submission.stopExecutionSession({
    sessionId: "sessionId"
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

**request:** `SeedApi.trace.StopExecutionSessionSubmissionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.submission.<a href="/src/api/resources/trace/resources/submission/client/Client.ts">getExecutionSessionsState</a>() -> SeedApi.GetExecutionSessionStateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.submission.getExecutionSessionsState();

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

**requestOptions:** `SubmissionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace Sysprop
<details><summary><code>client.trace.sysprop.<a href="/src/api/resources/trace/resources/sysprop/client/Client.ts">setNumWarmInstances</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.sysprop.setNumWarmInstances({
    language: "JAVA",
    numWarmInstances: 1
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

**request:** `SeedApi.trace.SetNumWarmInstancesSyspropRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SyspropClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.sysprop.<a href="/src/api/resources/trace/resources/sysprop/client/Client.ts">getNumWarmInstances</a>() -> Record&lt;string, number&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.trace.sysprop.getNumWarmInstances();

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

**requestOptions:** `SyspropClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace V2 Problem
<details><summary><code>client.trace.v2.problem.<a href="/src/api/resources/trace/resources/v2/resources/problem/client/Client.ts">getLightweightProblems</a>() -> SeedApi.V2LightweightProblemInfoV2[]</code></summary>
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

```typescript
await client.trace.v2.problem.getLightweightProblems();

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

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.problem.<a href="/src/api/resources/trace/resources/v2/resources/problem/client/Client.ts">getProblems</a>() -> SeedApi.V2ProblemInfoV2[]</code></summary>
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

```typescript
await client.trace.v2.problem.getProblems();

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

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.problem.<a href="/src/api/resources/trace/resources/v2/resources/problem/client/Client.ts">getLatestProblem</a>({ ...params }) -> SeedApi.V2ProblemInfoV2</code></summary>
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

```typescript
await client.trace.v2.problem.getLatestProblem({
    problemId: "problemId"
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

**request:** `SeedApi.trace.v2.GetLatestProblemProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.problem.<a href="/src/api/resources/trace/resources/v2/resources/problem/client/Client.ts">getProblemVersion</a>({ ...params }) -> SeedApi.V2ProblemInfoV2</code></summary>
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

```typescript
await client.trace.v2.problem.getProblemVersion({
    problemId: "problemId",
    problemVersion: 1
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

**request:** `SeedApi.trace.v2.GetProblemVersionProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Trace V2 V3 Problem
<details><summary><code>client.trace.v2.v3.problem.<a href="/src/api/resources/trace/resources/v2/resources/v3/resources/problem/client/Client.ts">getLightweightProblems</a>() -> SeedApi.V2V3LightweightProblemInfoV2[]</code></summary>
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

```typescript
await client.trace.v2.v3.problem.getLightweightProblems();

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

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.v3.problem.<a href="/src/api/resources/trace/resources/v2/resources/v3/resources/problem/client/Client.ts">getProblems</a>() -> SeedApi.V2V3ProblemInfoV2[]</code></summary>
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

```typescript
await client.trace.v2.v3.problem.getProblems();

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

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.v3.problem.<a href="/src/api/resources/trace/resources/v2/resources/v3/resources/problem/client/Client.ts">getLatestProblem</a>({ ...params }) -> SeedApi.V2V3ProblemInfoV2</code></summary>
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

```typescript
await client.trace.v2.v3.problem.getLatestProblem({
    problemId: "problemId"
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

**request:** `SeedApi.trace.v2.v3.GetLatestProblemProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.trace.v2.v3.problem.<a href="/src/api/resources/trace/resources/v2/resources/v3/resources/problem/client/Client.ts">getProblemVersion</a>({ ...params }) -> SeedApi.V2V3ProblemInfoV2</code></summary>
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

```typescript
await client.trace.v2.v3.problem.getProblemVersion({
    problemId: "problemId",
    problemVersion: 1
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

**request:** `SeedApi.trace.v2.v3.GetProblemVersionProblemRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProblemClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TsExtraProperties
<details><summary><code>client.tsExtraProperties.<a href="/src/api/resources/tsExtraProperties/client/Client.ts">getUser</a>() -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsExtraProperties.getUser();

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

**requestOptions:** `TsExtraPropertiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.tsExtraProperties.<a href="/src/api/resources/tsExtraProperties/client/Client.ts">createUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsExtraProperties.createUser({
    user_name: "user_name"
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

**request:** `SeedApi.tsExtraProperties.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TsExtraPropertiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TsInlineTypes TsInlineTypes
<details><summary><code>client.tsInlineTypes.tsInlineTypes.<a href="/src/api/resources/tsInlineTypes/resources/tsInlineTypes/client/Client.ts">getRoot</a>({ ...params }) -> SeedApi.RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsInlineTypes.tsInlineTypes.getRoot({
    bar: {
        foo: "foo"
    },
    foo: "foo"
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

**request:** `SeedApi.tsInlineTypes.GetRootRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TsInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.tsInlineTypes.tsInlineTypes.<a href="/src/api/resources/tsInlineTypes/resources/tsInlineTypes/client/Client.ts">getDiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsInlineTypes.tsInlineTypes.getDiscriminatedUnion({
    bar: {
        foo: "foo",
        bar: {
            foo: "foo",
            ref: {
                foo: "foo"
            }
        },
        ref: {
            foo: "foo"
        },
        type: "type1"
    },
    foo: "foo"
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

**request:** `SeedApi.tsInlineTypes.GetDiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TsInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.tsInlineTypes.tsInlineTypes.<a href="/src/api/resources/tsInlineTypes/resources/tsInlineTypes/client/Client.ts">getUndiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsInlineTypes.tsInlineTypes.getUndiscriminatedUnion({
    bar: "SUNNY",
    foo: "foo"
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

**request:** `SeedApi.tsInlineTypes.GetUndiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TsInlineTypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TsExpressCasing Imdb
<details><summary><code>client.tsExpressCasing.imdb.<a href="/src/api/resources/tsExpressCasing/resources/imdb/client/Client.ts">createMovie</a>({ ...params }) -> SeedApi.MovieId</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a movie to the database
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
await client.tsExpressCasing.imdb.createMovie({
    id: "id",
    movie_title: "movie_title",
    movie_rating: 1.1
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

**request:** `SeedApi.tsExpressCasing.CreateMovieImdbRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.tsExpressCasing.imdb.<a href="/src/api/resources/tsExpressCasing/resources/imdb/client/Client.ts">getMovie</a>({ ...params }) -> SeedApi.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.tsExpressCasing.imdb.getMovie({
    movie_id: "movie_id"
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

**request:** `SeedApi.tsExpressCasing.GetMovieImdbRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ImdbClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UndiscriminatedUnionWithResponseProperty UndiscriminatedUnionWithResponseProperty
<details><summary><code>client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.<a href="/src/api/resources/undiscriminatedUnionWithResponseProperty/resources/undiscriminatedUnionWithResponseProperty/client/Client.ts">getUnion</a>() -> SeedApi.UnionResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.getUnion();

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

**requestOptions:** `UndiscriminatedUnionWithResponsePropertyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.<a href="/src/api/resources/undiscriminatedUnionWithResponseProperty/resources/undiscriminatedUnionWithResponseProperty/client/Client.ts">listUnions</a>() -> SeedApi.UnionListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.listUnions();

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

**requestOptions:** `UndiscriminatedUnionWithResponsePropertyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UndiscriminatedUnions Union
<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">get</a>({ ...params }) -> SeedApi.MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.get("string");

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

**request:** `SeedApi.MyUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">getMetadata</a>() -> SeedApi.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.getMetadata();

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

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">updateMetadata</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.updateMetadata({
    "string": {
        "key": "value"
    }
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

**request:** `SeedApi.MetadataUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">call</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.call({
    union: {
        "string": {
            "key": "value"
        }
    }
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

**request:** `SeedApi.undiscriminatedUnions.Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">duplicateTypesUnion</a>({ ...params }) -> SeedApi.UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.duplicateTypesUnion("string");

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

**request:** `SeedApi.UnionWithDuplicateTypes` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">nestedUnions</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.nestedUnions("string");

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

**request:** `SeedApi.NestedUnionRoot` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">nestedObjectUnions</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.nestedObjectUnions("string");

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

**request:** `SeedApi.OuterNestedUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">aliasedObjectUnion</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.aliasedObjectUnion({
    "onlyInA": "onlyInA",
    "sharedNumber": 1
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

**request:** `SeedApi.AliasedObjectUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">getWithBaseProperties</a>({ ...params }) -> SeedApi.UnionWithBaseProperties</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.getWithBaseProperties({
    name: "name",
    value: {
        "key": "value"
    }
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

**request:** `SeedApi.UnionWithBaseProperties` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.undiscriminatedUnions.union.<a href="/src/api/resources/undiscriminatedUnions/resources/union/client/Client.ts">testCamelCaseProperties</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.undiscriminatedUnions.union.testCamelCaseProperties({
    paymentMethod: {
        method: "card",
        cardNumber: "1234567890123456"
    }
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

**request:** `SeedApi.undiscriminatedUnions.TestCamelCasePropertiesUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UnionQueryParameters Events
<details><summary><code>client.unionQueryParameters.events.<a href="/src/api/resources/unionQueryParameters/resources/events/client/Client.ts">subscribe</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Subscribe to events with a oneOf-style query parameter that may be a
scalar enum value or a list of enum values.
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
await client.unionQueryParameters.events.subscribe();

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

**request:** `SeedApi.unionQueryParameters.SubscribeEventsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `EventsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Unions Bigunion
<details><summary><code>client.unions.bigunion.<a href="/src/api/resources/unions/resources/bigunion/client/Client.ts">get</a>({ ...params }) -> SeedApi.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unions.bigunion.get({
    id: "id"
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

**request:** `SeedApi.unions.GetBigunionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unions.bigunion.<a href="/src/api/resources/unions/resources/bigunion/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unions.bigunion.update({
    value: "example1",
    type: "normalSweet"
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

**request:** `SeedApi.BigUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unions.bigunion.<a href="/src/api/resources/unions/resources/bigunion/client/Client.ts">updateMany</a>({ ...params }) -> Record&lt;string, boolean&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unions.bigunion.updateMany([{
        value: "example1",
        type: "normalSweet"
    }]);

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

**request:** `SeedApi.BigUnion[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Unions Union
<details><summary><code>client.unions.union.<a href="/src/api/resources/unions/resources/union/client/Client.ts">get</a>({ ...params }) -> SeedApi.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unions.union.get({
    id: "id"
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

**request:** `SeedApi.unions.GetUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unions.union.<a href="/src/api/resources/unions/resources/union/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unions.union.update({
    radius: 1.1,
    type: "circle"
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

**request:** `SeedApi.Shape` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UnionsWithLocalDate Bigunion
<details><summary><code>client.unionsWithLocalDate.bigunion.<a href="/src/api/resources/unionsWithLocalDate/resources/bigunion/client/Client.ts">get</a>({ ...params }) -> SeedApi.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.bigunion.get({
    id: "id"
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

**request:** `SeedApi.unionsWithLocalDate.GetBigunionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unionsWithLocalDate.bigunion.<a href="/src/api/resources/unionsWithLocalDate/resources/bigunion/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.bigunion.update({
    value: "example1",
    type: "normalSweet"
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

**request:** `SeedApi.BigUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unionsWithLocalDate.bigunion.<a href="/src/api/resources/unionsWithLocalDate/resources/bigunion/client/Client.ts">updateMany</a>({ ...params }) -> Record&lt;string, boolean&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.bigunion.updateMany([{
        value: "example1",
        type: "normalSweet"
    }]);

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

**request:** `SeedApi.BigUnion[]` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UnionsWithLocalDate Types
<details><summary><code>client.unionsWithLocalDate.types.<a href="/src/api/resources/unionsWithLocalDate/resources/types/client/Client.ts">get</a>({ ...params }) -> SeedApi.UnionWithTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.types.get({
    id: "date-example"
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

**request:** `SeedApi.unionsWithLocalDate.GetTypesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unionsWithLocalDate.types.<a href="/src/api/resources/unionsWithLocalDate/resources/types/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.types.update({
    type: "date",
    value: "1994-01-01"
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

**request:** `SeedApi.UnionWithTime` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UnionsWithLocalDate Union
<details><summary><code>client.unionsWithLocalDate.union.<a href="/src/api/resources/unionsWithLocalDate/resources/union/client/Client.ts">get</a>({ ...params }) -> SeedApi.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.union.get({
    id: "id"
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

**request:** `SeedApi.unionsWithLocalDate.GetUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unionsWithLocalDate.union.<a href="/src/api/resources/unionsWithLocalDate/resources/union/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unionsWithLocalDate.union.update({
    radius: 1.1,
    type: "circle"
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

**request:** `SeedApi.Shape` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Unknown Unknown
<details><summary><code>client.unknown.unknown.<a href="/src/api/resources/unknown/resources/unknown/client/Client.ts">post</a>({ ...params }) -> unknown[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unknown.unknown.post({
    "key": "value"
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

**request:** `unknown` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnknownClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unknown.unknown.<a href="/src/api/resources/unknown/resources/unknown/client/Client.ts">postObject</a>({ ...params }) -> unknown[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.unknown.unknown.postObject({
    unknown: {
        "key": "value"
    }
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

**request:** `SeedApi.MyObject` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnknownClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UrlFormEncoded
<details><summary><code>client.urlFormEncoded.<a href="/src/api/resources/urlFormEncoded/client/Client.ts">submitFormData</a>({ ...params }) -> SeedApi.PostSubmitResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.urlFormEncoded.submitFormData({
    username: "johndoe",
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

**request:** `SeedApi.urlFormEncoded.PostSubmitRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UrlFormEncodedClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.urlFormEncoded.<a href="/src/api/resources/urlFormEncoded/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.urlFormEncoded.getToken({
    client_id: "client_id",
    client_secret: "client_secret"
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

**request:** `SeedApi.TokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UrlFormEncodedClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Validation Validation
<details><summary><code>client.validation.validation.<a href="/src/api/resources/validation/resources/validation/client/Client.ts">create</a>({ ...params }) -> SeedApi.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.validation.validation.create({
    decimal: 1.1,
    even: 1,
    name: "name",
    shape: "SQUARE"
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

**request:** `SeedApi.validation.CreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ValidationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.validation.validation.<a href="/src/api/resources/validation/resources/validation/client/Client.ts">get</a>({ ...params }) -> SeedApi.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.validation.validation.get({
    decimal: 1.1,
    even: 1,
    name: "name"
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

**request:** `SeedApi.validation.GetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ValidationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Variables Service
<details><summary><code>client.variables.service.<a href="/src/api/resources/variables/resources/service/client/Client.ts">post</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.variables.service.post({
    endpointParam: "endpointParam"
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

**request:** `SeedApi.variables.PostServiceRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ServiceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Version User
<details><summary><code>client.version.user.<a href="/src/api/resources/version/resources/user/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.version.user.getUser({
    userId: "userId"
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

**request:** `SeedApi.version.GetUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## VersionNoDefault User
<details><summary><code>client.versionNoDefault.user.<a href="/src/api/resources/versionNoDefault/resources/user/client/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.versionNoDefault.user.getUser({
    userId: "userId"
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

**request:** `SeedApi.versionNoDefault.GetUserUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## WebsocketInferredAuth Auth
<details><summary><code>client.websocketInferredAuth.auth.<a href="/src/api/resources/websocketInferredAuth/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.websocketInferredAuth.auth.getTokenWithClientCredentials({
    client_id: "client_id",
    client_secret: "client_secret",
    audience: "https://api.example.com",
    grant_type: "client_credentials"
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

**request:** `SeedApi.websocketInferredAuth.GetTokenWithClientCredentialsAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.websocketInferredAuth.auth.<a href="/src/api/resources/websocketInferredAuth/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.websocketInferredAuth.auth.refreshToken({
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    audience: "https://api.example.com",
    grant_type: "refresh_token"
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

**request:** `SeedApi.websocketInferredAuth.RefreshTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## XFernDefault
<details><summary><code>client.xFernDefault.<a href="/src/api/resources/xFernDefault/client/Client.ts">testGet</a>({ ...params }) -> SeedApi.TestGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.xFernDefault.testGet({
    region: "region"
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

**request:** `SeedApi.xFernDefault.TestGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `XFernDefaultClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

