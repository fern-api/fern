# Reference
<details><summary><code>client.getLatestInsurance(userId) -> InsurancePolicy</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get latest insurance for a user. All query params are optional.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getLatestInsurance(
    "userId",
    UserGetLatestInsuranceRequest
        .builder()
        .includeExpired(true)
        .policyType(PolicyType.HEALTH)
        .build()
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**includeExpired:** `Optional<Boolean>` — Include expired insurance policies
    
</dd>
</dl>

<dl>
<dd>

**policyType:** `Optional<PolicyType>` — Filter by policy type
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.searchPolicies() -> List&lt;InsurancePolicy&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search policies with required query params
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.searchPolicies(
    SearchPoliciesRequest
        .builder()
        .query("query")
        .limit(1)
        .build()
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

**query:** `String` — Required search query
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` — Optional limit
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.listAllPolicies() -> List&lt;InsurancePolicy&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all policies
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.listAllPolicies();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
