# Reference
<details><summary><code><a href="./src/client.py">client.get_user()</a> -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Some description specific to the endpoint about users, etc. etc.

It can also be multi-line.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.get(user_id="ID")
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `str` — The ID of the user to retrieve.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Accounts
This package contains all endpoints on accounts...
<details><summary><code><a href="./src/accounts.py">client.accounts.get()</a> -> <a href="./src/accounts.py">Account</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Some description specific to the endpoint about accounts, etc. etc.

It can also be multi-line.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.accounts.get(account_id="ID")
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**account_id:** `str` 

The ID of the account to retrieve.

This is a multi-line description as well.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
This package contains all endpoints on users...
<details><summary><code><a href="./src/users.py">client.users.get()</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Some description specific to the endpoint about users, etc. etc.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.users.get(user_id="ID", account_id="ACCOUNT_ID")
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `str` — The ID of the user to retrieve.
    
</dd>
</dl>

<dl>
<dd>

**account_id:** `str` — The ID of the account to retrieve the user from.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code><a href="./src/users.py">client.users.update()</a></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Some description specific to the endpoint about users, etc. etc.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.users.get(update=User(id="ID")
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**update:** `<a href="./src/users.py">User</a>` — The updated user object to send to the server.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
