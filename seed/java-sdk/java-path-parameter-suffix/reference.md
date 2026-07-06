# Reference
<details><summary><code>client.fetchMessage(accountSid, sid) -> Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.fetchMessage(
    "accountSid",
    "sid",
    FetchMessageRequest
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

**accountSid:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**sid:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.updateMessage(accountSid, sid, request) -> Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.updateMessage(
    "accountSid",
    "sid",
    UpdateMessageRequest
        .builder()
        .body("body")
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

**accountSid:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**sid:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**body:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.fetchAccount(accountSid) -> Account</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.fetchAccount(
    "accountSid",
    FetchAccountRequest
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

**accountSid:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

