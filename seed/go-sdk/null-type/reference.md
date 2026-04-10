# Reference
## Conversations
<details><summary><code>client.Conversations.OutboundCall(request) -> *fern.OutboundCallConversationsResponse</code></summary>
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

```go
request := &fern.OutboundCallConversationsRequest{
        ToPhoneNumber: "to_phone_number",
    }
client.Conversations.OutboundCall(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**toPhoneNumber:** `string` — The phone number to call in E.164 format.
    
</dd>
</dl>

<dl>
<dd>

**dryRun:** `*bool` — If true, validates the outbound call setup without placing a call.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.Get(ID) -> *fern.User</code></summary>
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

```go
request := &fern.GetUsersRequest{
        ID: "id",
    }
client.Users.Get(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

