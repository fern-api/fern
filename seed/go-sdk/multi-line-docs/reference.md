# Reference
## User
<details><summary><code>client.User.GetUser(UserId) -> error</code></summary>
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

```go
client.User.GetUser(
        context.TODO(),
        "userId",
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

**userId:** `string` 

The ID of the user to retrieve.
This ID is unique to each user.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.CreateUser(request) -> *fern.User</code></summary>
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

```go
client.User.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Name: "name",
            Age: fern.Int(
                1,
            ),
        },
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

**name:** `string` 

The name of the user to create.
This name is unique to each user.
    
</dd>
</dl>

<dl>
<dd>

**age:** `*int` 

The age of the user.
This property is not required.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
