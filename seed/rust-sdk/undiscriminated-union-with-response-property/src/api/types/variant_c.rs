pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantC {
    pub r#type: String,
    #[serde(rename = "valueC")]
    #[serde(default)]
    pub value_c: bool,
}
