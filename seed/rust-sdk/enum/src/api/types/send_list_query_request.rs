pub use crate::prelude::*;

/// Query parameters for sendList
///
/// Request type for the SendListQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendListQueryRequest {
    pub operand: Vec<Operand>,
    #[serde(rename = "maybeOperand")]
    pub maybe_operand: Vec<Option<Operand>>,
    #[serde(rename = "operandOrColor")]
    pub operand_or_color: Vec<ColorOrOperand>,
    #[serde(rename = "maybeOperandOrColor")]
    pub maybe_operand_or_color: Vec<Option<ColorOrOperand>>,
}
