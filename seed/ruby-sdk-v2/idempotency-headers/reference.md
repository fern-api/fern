# Reference
## Payment
<details><summary><code>client.payment.<a href="/lib/seed/payment/client.rb">create</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.payment.create(
  amount: 1,
  currency: 'USD'
);
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

**amount:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**currency:** `Seed::Payment::Types::Currency` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Payment::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment.<a href="/lib/seed/payment/client.rb">delete</a>(payment_id) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.payment.delete(payment_id: 'paymentId');
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

**payment_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Payment::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
