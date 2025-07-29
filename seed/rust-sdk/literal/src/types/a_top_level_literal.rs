use crate::a_nested_literal::ANestedLiteral;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ATopLevelLiteral {
    #[serde(rename = "nestedLiteral")]
    pub nested_literal: ANestedLiteral,
}