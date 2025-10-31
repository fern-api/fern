pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantA {
    pub r#type: String,
    #[serde(rename = "valueA")]
    pub value_a: String,
}
