# Reference
## Imdb
<details><summary><code>$client-><a href="/Fern/Imdb/ImdbClient.php">createMovie</a>($request) -> string</code></summary>
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

```php
<?php

use Fern;

// Initialize the client
$client = new SeedClient(
    token: '<YOUR_TOKEN>'
);

// Call the createMovie endpoint
$response = $client->imdb->createMovie(
    $request, // Request object
);

// $response is of type: string
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**$request:** `\Fern\Imdb\Types\CreateMovieRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-><a href="/Fern/Imdb/ImdbClient.php">getMovie</a>($$movieId) -> \Fern\Imdb\Types\Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
<?php

use Fern;

// Initialize the client
$client = new SeedClient(
    token: '<YOUR_TOKEN>'
);

// Call the getMovie endpoint
$response = $client->imdb->getMovie(
    movieId: 'example-id', // string
);

// $response is of type: \Fern\Imdb\Types\Movie
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**$movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
