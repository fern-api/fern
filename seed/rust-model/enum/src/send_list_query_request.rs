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

impl SendListQueryRequest {
    pub fn builder() -> SendListQueryRequestBuilder {
        SendListQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendListQueryRequestBuilder {
    operand: Option<Vec<Operand>>,
    maybe_operand: Option<Vec<Option<Operand>>>,
    operand_or_color: Option<Vec<ColorOrOperand>>,
    maybe_operand_or_color: Option<Vec<Option<ColorOrOperand>>>,
}

impl SendListQueryRequestBuilder {
    pub fn operand(mut self, value: Vec<Operand>) -> Self {
        self.operand = Some(value);
        self
    }

    pub fn maybe_operand(mut self, value: Vec<Option<Operand>>) -> Self {
        self.maybe_operand = Some(value);
        self
    }

    pub fn operand_or_color(mut self, value: Vec<ColorOrOperand>) -> Self {
        self.operand_or_color = Some(value);
        self
    }

    pub fn maybe_operand_or_color(mut self, value: Vec<Option<ColorOrOperand>>) -> Self {
        self.maybe_operand_or_color = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendListQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`operand`](SendListQueryRequestBuilder::operand)
    /// - [`maybe_operand`](SendListQueryRequestBuilder::maybe_operand)
    /// - [`operand_or_color`](SendListQueryRequestBuilder::operand_or_color)
    /// - [`maybe_operand_or_color`](SendListQueryRequestBuilder::maybe_operand_or_color)
    pub fn build(self) -> Result<SendListQueryRequest, BuildError> {
        Ok(SendListQueryRequest {
            operand: self.operand.ok_or_else(|| BuildError::missing_field("operand"))?,
            maybe_operand: self.maybe_operand.ok_or_else(|| BuildError::missing_field("maybe_operand"))?,
            operand_or_color: self.operand_or_color.ok_or_else(|| BuildError::missing_field("operand_or_color"))?,
            maybe_operand_or_color: self.maybe_operand_or_color.ok_or_else(|| BuildError::missing_field("maybe_operand_or_color"))?,
        })
    }
}

