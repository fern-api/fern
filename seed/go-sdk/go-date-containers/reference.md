# Reference
## Loans
<details><summary><code>client.Loans.GetLoan() -> *fern.Loan</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
_, err := client.Loans.GetLoan(
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

<details><summary><code>client.Loans.ListLoansByDate(AsOf) -> []*fern.Loan</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListLoansByDateRequest{
    AsOf: fern.MustParseDate(
        "2023-01-15",
    ),
    Page: &fern.PageRequest{
        Number: fern.Int(
            1,
        ),
        Size: fern.Int(
            1,
        ),
    },
}
_, err := client.Loans.ListLoansByDate(
    context.TODO(),
    request,
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

**asOf:** `time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**page:** `*fern.PageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Loans.ListLoansByTimestamp(AsOf) -> []*fern.Loan</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListLoansByTimestampRequest{
    AsOf: fern.MustParseDateTime(
        "2002-08-28T12:30:00Z",
    ),
}
_, err := client.Loans.ListLoansByTimestamp(
    context.TODO(),
    request,
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

**asOf:** `time.Time` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

