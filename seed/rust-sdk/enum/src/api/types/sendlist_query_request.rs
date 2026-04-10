pub use crate::prelude::*;

/// Query parameters for sendlist
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendlistQueryRequest {
    #[serde(default)]
    pub operand: Vec<Option<Operand>>,
    #[serde(rename = "maybeOperand")]
    #[serde(default)]
    pub maybe_operand: Vec<Option<Operand>>,
    #[serde(rename = "operandOrColor")]
    #[serde(default)]
    pub operand_or_color: Vec<Option<ColorOrOperand>>,
    #[serde(rename = "maybeOperandOrColor")]
    #[serde(default)]
    pub maybe_operand_or_color: Vec<Option<ColorOrOperand>>,
}

impl SendlistQueryRequest {
    pub fn builder() -> SendlistQueryRequestBuilder {
        <SendlistQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendlistQueryRequestBuilder {
    operand: Option<Vec<Option<Operand>>>,
    maybe_operand: Option<Vec<Option<Operand>>>,
    operand_or_color: Option<Vec<Option<ColorOrOperand>>>,
    maybe_operand_or_color: Option<Vec<Option<ColorOrOperand>>>,
}

impl SendlistQueryRequestBuilder {
    pub fn operand(mut self, value: Vec<Option<Operand>>) -> Self {
        self.operand = Some(value);
        self
    }

    pub fn maybe_operand(mut self, value: Vec<Option<Operand>>) -> Self {
        self.maybe_operand = Some(value);
        self
    }

    pub fn operand_or_color(mut self, value: Vec<Option<ColorOrOperand>>) -> Self {
        self.operand_or_color = Some(value);
        self
    }

    pub fn maybe_operand_or_color(mut self, value: Vec<Option<ColorOrOperand>>) -> Self {
        self.maybe_operand_or_color = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendlistQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`operand`](SendlistQueryRequestBuilder::operand)
    /// - [`maybe_operand`](SendlistQueryRequestBuilder::maybe_operand)
    /// - [`operand_or_color`](SendlistQueryRequestBuilder::operand_or_color)
    /// - [`maybe_operand_or_color`](SendlistQueryRequestBuilder::maybe_operand_or_color)
    pub fn build(self) -> Result<SendlistQueryRequest, BuildError> {
        Ok(SendlistQueryRequest {
            operand: self.operand.ok_or_else(|| BuildError::missing_field("operand"))?,
            maybe_operand: self.maybe_operand.ok_or_else(|| BuildError::missing_field("maybe_operand"))?,
            operand_or_color: self.operand_or_color.ok_or_else(|| BuildError::missing_field("operand_or_color"))?,
            maybe_operand_or_color: self.maybe_operand_or_color.ok_or_else(|| BuildError::missing_field("maybe_operand_or_color"))?,
        })
    }
}

