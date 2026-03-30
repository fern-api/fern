pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendEnumInlinedRequest {
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

impl SendEnumInlinedRequest {
    pub fn builder() -> SendEnumInlinedRequestBuilder {
        <SendEnumInlinedRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendEnumInlinedRequestBuilder {
    operand: Option<Operand>,
    maybe_operand: Option<Operand>,
    operand_or_color: Option<ColorOrOperand>,
    maybe_operand_or_color: Option<ColorOrOperand>,
}

impl SendEnumInlinedRequestBuilder {
    pub fn operand(mut self, value: Operand) -> Self {
        self.operand = Some(value);
        self
    }

    pub fn maybe_operand(mut self, value: Operand) -> Self {
        self.maybe_operand = Some(value);
        self
    }

    pub fn operand_or_color(mut self, value: ColorOrOperand) -> Self {
        self.operand_or_color = Some(value);
        self
    }

    pub fn maybe_operand_or_color(mut self, value: ColorOrOperand) -> Self {
        self.maybe_operand_or_color = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendEnumInlinedRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`operand`](SendEnumInlinedRequestBuilder::operand)
    /// - [`operand_or_color`](SendEnumInlinedRequestBuilder::operand_or_color)
    pub fn build(self) -> Result<SendEnumInlinedRequest, BuildError> {
        Ok(SendEnumInlinedRequest {
            operand: self
                .operand
                .ok_or_else(|| BuildError::missing_field("operand"))?,
            maybe_operand: self.maybe_operand,
            operand_or_color: self
                .operand_or_color
                .ok_or_else(|| BuildError::missing_field("operand_or_color"))?,
            maybe_operand_or_color: self.maybe_operand_or_color,
        })
    }
}
