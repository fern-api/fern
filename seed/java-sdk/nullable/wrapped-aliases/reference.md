# Reference
## Nullable
<details><summary><code>client.nullable.getusers() -> List&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().getusers(
    NullableGetUsersRequest
        .builder()
        .build()
);
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**usernames:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.createuser(request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().createuser(
    NullableCreateUserRequest
        .builder()
        .username("username")
        .build()
);
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<List<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Optional<Metadata>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.deleteuser(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.nullable().deleteuser(
    NullableDeleteUserRequest
        .builder()
        .build()
);
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**username:** `Optional<String>` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

