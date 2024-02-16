
## Echo


<details><summary> <code>examples.<a href="src//Client.ts">echo</a>({ ...params }) -> string</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.echo("Hello world!");
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**request: `string`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `SeedExamplesClient.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>




## File Notification Service


<details><summary> <code>examples.<a href="src//api/resources/file/resources/notification/resources/service/client/Client.ts">getException</a>({ ...params }) -> SeedExamples.Exception</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.file.notification.service.getException("notification-hsy129x");
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**notificationId: `string`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>




## File Service


<details><summary> <code>examples.<a href="src//api/resources/file/resources/service/client/Client.ts">getFile</a>({ ...params }) -> SeedExamples.File_</code> </summary>

<dl>

<dd>

<br/>

<dl>

<dd>

> This endpoint returns a file by its name.

</dd>

</dl>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.file.service.getFile("file.txt", {
    xFileApiVersion: "0.0.2"
});
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**filename: `string`** —This is a filename


</dd>

</dl>

<dl>

<dd>


**request: `SeedExamples.file.GetFileRequest`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>




## Health Service


<details><summary> <code>examples.<a href="src//api/resources/health/resources/service/client/Client.ts">check</a>({ ...params }) -> void</code> </summary>

<dl>

<dd>

<br/>

<dl>

<dd>

> This endpoint checks the health of a resource.

</dd>

</dl>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.health.service.check("id-2sdx82h");
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**id: `string`** —The id to check


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>


<details><summary> <code>examples.<a href="src//api/resources/health/resources/service/client/Client.ts">ping</a>({ ...params }) -> boolean</code> </summary>

<dl>

<dd>

<br/>

<dl>

<dd>

> This endpoint checks the health of the service.

</dd>

</dl>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.health.service.ping();
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>




## Service


<details><summary> <code>examples.<a href="src//api/resources/service/client/Client.ts">getMovie</a>({ ...params }) -> SeedExamples.Movie</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.service.getMovie("movie-c06a4ad7");
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**movieId: `SeedExamples.MovieId`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>


<details><summary> <code>examples.<a href="src//api/resources/service/client/Client.ts">createMovie</a>({ ...params }) -> SeedExamples.MovieId</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.service.createMovie({
    id: "movie-c06a4ad7",
    title: "The Boy and the Heron",
    from: "Hayao Miyazaki",
    rating: 8,
    type: "movie",
    tag: "tag-wf9as23d"
});
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**request: `SeedExamples.Movie`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>


<details><summary> <code>examples.<a href="src//api/resources/service/client/Client.ts">getMetadata</a>({ ...params }) -> SeedExamples.Metadata</code> </summary>

<dl>

<dd>

#### 🔌 Usage

<dl>

<dd>

<dl>

<dd>

```ts
await seedExamples.service.getMetadata({
    xApiVersion: "0.0.1",
    shallow: false,
    tag: "development"
});
```

</dd>

</dl>

</dd>

</dl>

#### ⚙️ Parameters

<dl>

<dd>

<dl>

<dd>


**request: `SeedExamples.GetMetadataRequest`** 


</dd>

</dl>

<dl>

<dd>


**requestOptions: `Service.RequestOptions`** 


</dd>

</dl>

</dd>

</dl>



</dd>

</dl>
</details>


