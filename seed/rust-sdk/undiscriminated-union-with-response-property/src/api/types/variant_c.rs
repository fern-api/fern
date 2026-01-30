pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariantC {
    pub r#type: String,
    #[serde(rename = "valueC")]
    pub value_c: bool,
}