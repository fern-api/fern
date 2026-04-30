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
request := &fern.JustFileRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.JustFile(
        context.TODO(),
        request,
    )
}
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
request := &fern.OptionalArgsRequest{
        ImageFile: strings.NewReader(
            "",
        ),
    }
client.Service.OptionalArgs(
        context.TODO(),
        request,
    )
}
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
        ImageFile: strings.NewReader(
            "",
        ),
        Request: &fern.MyObject{
            Foo: "bar",
        },
    }
client.Service.WithRefBody(
        context.TODO(),
        request,
    )
}
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
client.Service.Simple(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

