# Reference
<details><summary><code>$client->search($request) -> SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->search(
    new SearchRequest([
        'limit' => 1,
        'id' => 'id',
        'date' => new DateTime('2023-01-15'),
        'deadline' => new DateTime('2024-01-15T09:30:00Z'),
        'bytes' => 'bytes',
        'user' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'userList' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'optionalDeadline' => new DateTime('2024-01-15T09:30:00Z'),
        'keyValue' => [
            'keyValue' => 'keyValue',
        ],
        'optionalString' => 'optionalString',
        'nestedUser' => new NestedUser([
            'name' => 'name',
            'user' => new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ]),
        'optionalUser' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'excludeUser' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'filter' => [
            'filter',
        ],
        'neighbor' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'neighborRequired' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
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

**$limit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$date:** `DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$deadline:** `DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$bytes:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**$userList:** `?User` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalDeadline:** `?DateTime` 
    
</dd>
</dl>

<dl>
<dd>

**$keyValue:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalString:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$nestedUser:** `?NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalUser:** `?User` 
    
</dd>
</dl>

<dl>
<dd>

**$excludeUser:** `?User` 
    
</dd>
</dl>

<dl>
<dd>

**$filter:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$neighbor:** `User|NestedUser|string|int|null` 
    
</dd>
</dl>

<dl>
<dd>

**$neighborRequired:** `User|NestedUser|string|int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
