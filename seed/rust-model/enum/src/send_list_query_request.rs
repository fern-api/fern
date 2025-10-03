pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendListQueryRequest {
    pub operand: Operand,
    #[serde(rename = "maybeOperand")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_operand: Option<Operand>,
    #[serde(rename = "operandOrColor")]
    pub operand_or_color: ColorOrOperand,
    #[serde(rename = "maybeOperandOrColor")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_operand_or_color: Option<ColorOrOperand>,
}

