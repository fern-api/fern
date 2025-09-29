# Reference
## Bigunion
<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">get</a>(id: String) -> Result<BigUnion, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.get(&"id".to_string(), None).await;
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">update</a>(request: BigUnion) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use chrono::{DateTime, Utc};
use seed_unions::{
    ActiveDiamond, AttractiveScript, BigUnion, CircularCard, ClientConfig, ColorfulCover,
    DiligentDeal, DisloyalValue, DistinctFailure, FalseMirror, FrozenSleep, GaseousRoad,
    GruesomeCoach, HarmoniousPlay, HastyPain, HoarseMouse, JumboEnd, LimpingStep, MistySnow,
    NormalSweet, PopularLimit, PotableBad, PracticalPrinciple, PrimaryBlock, RotatingRatio,
    ThankfulFactor, TotalWork, TriangularRepair, UnionsClient, UniqueStress, UnwillingSmoke,
    VibrantExcitement,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update(
            &BigUnion::NormalSweet {
                data: NormalSweet {
                    value: "value".to_string(),
                },
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">update_many</a>(request: Vec<BigUnion>) -> Result<std::collections::HashMap<String, bool>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use chrono::{DateTime, Utc};
use seed_unions::{BigUnion, ClientConfig, NormalSweet, UnionsClient};
use std::collections::{HashMap, HashSet};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update_many(
            &vec![
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
                    },
                },
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
                    },
                },
            ],
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">get</a>(id: String) -> Result<Shape, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.get(&"id".to_string(), None).await;
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">update</a>(request: Shape) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::{
    ActiveDiamond, AttractiveScript, BigUnion, Circle, CircularCard, ClientConfig, ColorfulCover,
    DiligentDeal, DisloyalValue, DistinctFailure, FalseMirror, FrozenSleep, GaseousRoad,
    GruesomeCoach, HarmoniousPlay, HastyPain, HoarseMouse, JumboEnd, LimpingStep, MistySnow,
    NormalSweet, PopularLimit, PotableBad, PracticalPrinciple, PrimaryBlock, RotatingRatio, Shape,
    ThankfulFactor, TotalWork, TriangularRepair, UnionsClient, UniqueStress, UnwillingSmoke,
    VibrantExcitement,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.update(&Default::default(), None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
