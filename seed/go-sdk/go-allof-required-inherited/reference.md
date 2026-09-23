# Reference
<details><summary><code>client.GetTransactions(request) -> *fern.TransactionsGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TransactionsGetRequest{
    AccessToken: "access_token",
}
client.GetTransactions(
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

**accessToken:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreatePlant(request) -> *fern.PlantDetails</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PlantCreate{
    Species: "species",
}
client.CreatePlant(
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

**nickname:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**species:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**legacyTag:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreatePaymentSchedule(request) -> *fern.ExternalPaymentScheduleGet</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ExternalPaymentScheduleRequest{
    StartDate: fern.MustParseDate(
        "2023-01-15",
    ),
    Interval: fern.PaymentScheduleIntervalWeekly,
    IntervalExecutionDay: 1,
}
client.CreatePaymentSchedule(
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

**startDate:** `time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**interval:** `*fern.PaymentScheduleInterval` 
    
</dd>
</dl>

<dl>
<dd>

**intervalExecutionDay:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**endDate:** `*time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**adjustedStartDate:** `*time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**description:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

