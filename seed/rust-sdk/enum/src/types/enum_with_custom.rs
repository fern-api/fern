use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EnumWithCustom {
    #[serde(rename = "safe")]
    Safe,
    Custom,
}