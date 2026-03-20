pub use crate::prelude::*;

/// Query parameters for sendList
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendListQueryRequest {
    #[serde(default)]
    pub operand: Vec<Operand>,
    #[serde(rename = "maybeOperand")]
    #[serde(default)]
    pub maybe_operand: Vec<Option<Operand>>,
    #[serde(rename = "operandOrColor")]
    #[serde(default)]
    pub operand_or_color: Vec<ColorOrOperand>,
    #[serde(rename = "maybeOperandOrColor")]
    #[serde(default)]
    pub maybe_operand_or_color: Vec<Option<ColorOrOperand>>,
}
