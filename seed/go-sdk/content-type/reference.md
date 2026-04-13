# Reference
## Service
<details><summary><code>client.Service.Patch(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServicePatchRequest{}
client.Service.Patch(
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

**application:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**requireAuth:** `*bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Patchcomplex(ID, request) -> error</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
request := &fern.ServicePatchComplexRequest{
        ID: "id",
    }
client.Service.Patchcomplex(
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `map[string]any` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `[]string` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**profileImageURL:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `map[string]any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Namedpatchwithmixed(ID, request) -> error</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
request := &fern.ServiceNamedPatchWithMixedRequest{
        ID: "id",
    }
client.Service.Namedpatchwithmixed(
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**appID:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `*bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Optionalmergepatchtest(request) -> error</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
request := &fern.ServiceOptionalMergePatchTestRequest{
        RequiredField: "requiredField",
    }
client.Service.Optionalmergepatchtest(
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

**requiredField:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**optionalInteger:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**optionalBoolean:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**nullableString:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Regularpatch(ID, request) -> error</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
request := &fern.ServiceRegularPatchRequest{
        ID: "id",
    }
client.Service.Regularpatch(
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**field1:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**field2:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

