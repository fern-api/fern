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
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.headers.send(
    operand=">",
    operand_or_color="red",
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

## Inlinedrequest
<details><summary><code>client.inlinedrequest.<a href="src/seed/inlinedrequest/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.inlinedrequest.send(
    operand=">",
    operand_or_color="red",
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

## Multipartform
<details><summary><code>client.multipartform.<a href="src/seed/multipartform/client.py">multipartform</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.multipartform.multipartform()

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

**color:** `typing.Optional[Color]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_color:** `typing.Optional[Color]` 
    
</dd>
</dl>

<dl>
<dd>

**color_list:** `typing.Optional[typing.List[Color]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_color_list:** `typing.Optional[typing.List[Color]]` 
    
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

## Pathparam
<details><summary><code>client.pathparam.<a href="src/seed/pathparam/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.pathparam.send(
    operand=">",
    operand_or_color="red",
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

## Queryparam
<details><summary><code>client.queryparam.<a href="src/seed/queryparam/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.queryparam.send(
    operand=">",
    operand_or_color="red",
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

**operand_or_color:** `Color` 
    
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

<details><summary><code>client.queryparam.<a href="src/seed/queryparam/client.py">sendlist</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.queryparam.sendlist(
    operand=[
        ">"
    ],
    maybe_operand=[
        ">"
    ],
    operand_or_color=[
        "red"
    ],
    maybe_operand_or_color=[
        "red"
    ],
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

**operand:** `typing.Optional[typing.Union[Operand, typing.Sequence[Operand]]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `typing.Optional[typing.Union[Operand, typing.Sequence[Operand]]]` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `typing.Optional[typing.Union[ColorOrOperand, typing.Sequence[ColorOrOperand]]]` 
    
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

