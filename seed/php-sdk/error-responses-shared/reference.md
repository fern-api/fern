# Reference
## Calls Calls
<details><summary><code>$client-&gt;calls-&gt;calls-&gt;createCall() -> ?Call</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->calls->calls->createCall();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>$client-&gt;messages-&gt;messages-&gt;listMessages() -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->messages->messages->listMessages();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;messages-&gt;messages-&gt;createMessage($request) -> ?Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->messages->messages->createMessage(
    new Message([
        'sid' => 'sid',
        'body' => 'body',
    ]),
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

**$request:** `Message` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;messages-&gt;messages-&gt;deleteMessage($sid)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->messages->messages->deleteMessage(
    'sid',
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

**$sid:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

