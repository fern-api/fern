pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlinedANestedLiteral {
    #[serde(rename = "myLiteral")]
    pub my_literal: String,
}
