pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantA {
    pub r#type: String,
    #[serde(rename = "valueA")]
    #[serde(default)]
    pub value_a: String,
}