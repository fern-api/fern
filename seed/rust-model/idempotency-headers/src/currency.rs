use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Currency {
    #[serde(rename = "USD")]
    Usd,
    #[serde(rename = "YEN")]
    Yen,
}