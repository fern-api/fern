
## Echo


<details><summary> <code>examples.echo({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.echo("Hello world!");
```

</dl>

</dd>





</dd>
</dl>

</details>




## File Notification Service


<details><summary> <code>examples.getException({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.file.notification.service.getException("notification-hsy129x");
```

</dl>

</dd>





</dd>
</dl>

</details>




## File Service


<details><summary> <code>examples.getFile({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.file.service.getFile("file.txt", {
    xFileApiVersion: "0.0.2"
});
```

</dl>

</dd>





</dd>
</dl>

</details>




## Health Service


<details><summary> <code>examples.check({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.health.service.check("id-2sdx82h");
```

</dl>

</dd>





</dd>
</dl>

</details>


<details><summary> <code>examples.ping({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.health.service.ping();
```

</dl>

</dd>





</dd>
</dl>

</details>




## Service


<details><summary> <code>examples.getMovie({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.service.getMovie("movie-c06a4ad7");
```

</dl>

</dd>





</dd>
</dl>

</details>


<details><summary> <code>examples.createMovie({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

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

</dl>

</dd>





</dd>
</dl>

</details>


<details><summary> <code>examples.getMetadata({ ...params }) -> void</code> </summary>

<dl>
<dd>

#### 🔌 Usage

<dl>

<dd>

```ts
await seedExamples.service.getMetadata({
    xApiVersion: "0.0.1",
    shallow: false,
    tag: "development"
});
```

</dl>

</dd>





</dd>
</dl>

</details>


