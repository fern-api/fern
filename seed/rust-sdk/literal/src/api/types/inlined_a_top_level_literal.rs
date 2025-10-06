pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlinedATopLevelLiteral {
    #[serde(rename = "nestedLiteral")]
    pub nested_literal: InlinedANestedLiteral,
}
