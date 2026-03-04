pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantB {
    pub r#type: String,
    #[serde(rename = "valueB")]
    pub value_b: i64,
}
