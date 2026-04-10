# Reference
## Service
<details><summary><code>client.Service.Post(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServicePostRequest{
        File: strings.NewReader(
            "",
        ),
        FileList: strings.NewReader(
            "",
        ),
        MaybeFile: strings.NewReader(
            "",
        ),
        MaybeFileList: strings.NewReader(
            "",
        ),
    }
client.Service.Post(
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

<details><summary><code>client.Service.Justfile(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceJustFileRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Justfile(
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

<details><summary><code>client.Service.Justfilewithoptionalqueryparams(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceJustFileWithOptionalQueryParamsRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Justfilewithoptionalqueryparams(
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

**maybeString:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**maybeInteger:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Withcontenttype(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithContentTypeRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Withcontenttype(
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

<details><summary><code>client.Service.Withformencoding(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithFormEncodingRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Withformencoding(
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

<details><summary><code>client.Service.Withformencodedcontainers(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithFormEncodedContainersRequest{
        File: strings.NewReader(
            "",
        ),
        FileList: strings.NewReader(
            "",
        ),
        MaybeFile: strings.NewReader(
            "",
        ),
        MaybeFileList: strings.NewReader(
            "",
        ),
    }
client.Service.Withformencodedcontainers(
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

<details><summary><code>client.Service.Optionalargs(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceOptionalArgsRequest{
        ImageFile: strings.NewReader(
            "",
        ),
    }
client.Service.Optionalargs(
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

<details><summary><code>client.Service.Withinlinetype(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithInlineTypeRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Withinlinetype(
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

<details><summary><code>client.Service.Withjsonproperty(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithJSONPropertyRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Withjsonproperty(
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

<details><summary><code>client.Service.Withliteralandenumtypes(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceWithLiteralAndEnumTypesRequest{
        File: strings.NewReader(
            "",
        ),
    }
client.Service.Withliteralandenumtypes(
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

