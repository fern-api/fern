# Reference
## Headers
<details><summary><code>client.headers.<a href="src/seed/headers/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Color, Operand, SeedEnum

client = SeedEnum(
    base_url="https://yourhost.com/path/to/api",
)
client.headers.send(
    operand=Operand.GREATER_THAN,
    maybe_operand=Operand.GREATER_THAN,
    operand_or_color=Color.RED,
)

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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `typing.Optional[Operand]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `typing.Optional[ColorOrOperand]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.inlined_request.<a href="src/seed/inlined_request/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Color, Operand, SeedEnum

client = SeedEnum(
    base_url="https://yourhost.com/path/to/api",
)
client.inlined_request.send(
    operand=Operand.GREATER_THAN,
    operand_or_color=Color.RED,
)

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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `typing.Optional[Operand]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `typing.Optional[ColorOrOperand]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipartForm
## PathParam
<details><summary><code>client.path_param.<a href="src/seed/path_param/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Color, Operand, SeedEnum

client = SeedEnum(
    base_url="https://yourhost.com/path/to/api",
)
client.path_param.send(
    operand=Operand.GREATER_THAN,
    operand_or_color=Color.RED,
)

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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.query_param.<a href="src/seed/query_param/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Color, Operand, SeedEnum

client = SeedEnum(
    base_url="https://yourhost.com/path/to/api",
)
client.query_param.send(
    operand=Operand.GREATER_THAN,
    operand_or_color=Color.RED,
)

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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `typing.Optional[Operand]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `typing.Optional[ColorOrOperand]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query_param.<a href="src/seed/query_param/client.py">send_list</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Color, Operand, SeedEnum

client = SeedEnum(
    base_url="https://yourhost.com/path/to/api",
)
client.query_param.send_list(
    operand=Operand.GREATER_THAN,
    maybe_operand=Operand.GREATER_THAN,
    operand_or_color=Color.RED,
    maybe_operand_or_color=Color.RED,
)

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

**operand:** `typing.Union[Operand, typing.Sequence[Operand]]` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `typing.Union[ColorOrOperand, typing.Sequence[ColorOrOperand]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `typing.Optional[typing.Union[Operand, typing.Sequence[Operand]]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `typing.Optional[typing.Union[ColorOrOperand, typing.Sequence[ColorOrOperand]]]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

