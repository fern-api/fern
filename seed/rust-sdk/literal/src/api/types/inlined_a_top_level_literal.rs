pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ATopLevelLiteral {
    #[serde(rename = "nestedLiteral")]
    pub nested_literal: ANestedLiteral,
}