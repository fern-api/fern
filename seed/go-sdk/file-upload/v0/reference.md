# Reference
## Service
<details><summary><code>client.Service.JustFile(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
err := client.Service.JustFile(
    context.TODO(),
    strings.NewReader(
        "",
    ),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.OptionalArgs(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.OptionalArgsRequest{}
_, err := client.Service.OptionalArgs(
    context.TODO(),
    strings.NewReader(
        "",
    ),
    request,
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.WithRefBody(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.WithRefBodyRequest{
    Request: &fern.MyObject{
        Foo: "bar",
    },
}
_, err := client.Service.WithRefBody(
    context.TODO(),
    strings.NewReader(
        "",
    ),
    request,
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Simple() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
err := client.Service.Simple(
    context.TODO(),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

