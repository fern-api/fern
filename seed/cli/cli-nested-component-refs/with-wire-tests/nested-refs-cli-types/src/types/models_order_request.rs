pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelsOrderRequest {
    #[serde(rename = "customerId")]
    #[serde(default)]
    pub customer_id: String,
    #[serde(rename = "shipTo")]
    #[serde(default)]
    pub ship_to: ModelsOrderRequestShipTo,
    #[serde(default)]
    pub lines: Vec<ModelsOrderRequestLinesItem>,
}

impl ModelsOrderRequest {
    pub fn builder() -> ModelsOrderRequestBuilder {
        <ModelsOrderRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsOrderRequestBuilder {
    customer_id: Option<String>,
    ship_to: Option<ModelsOrderRequestShipTo>,
    lines: Option<Vec<ModelsOrderRequestLinesItem>>,
}

impl ModelsOrderRequestBuilder {
    pub fn customer_id(mut self, value: impl Into<String>) -> Self {
        self.customer_id = Some(value.into());
        self
    }

    pub fn ship_to(mut self, value: ModelsOrderRequestShipTo) -> Self {
        self.ship_to = Some(value);
        self
    }

    pub fn lines(mut self, value: Vec<ModelsOrderRequestLinesItem>) -> Self {
        self.lines = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ModelsOrderRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`customer_id`](ModelsOrderRequestBuilder::customer_id)
    /// - [`ship_to`](ModelsOrderRequestBuilder::ship_to)
    /// - [`lines`](ModelsOrderRequestBuilder::lines)
    pub fn build(self) -> Result<ModelsOrderRequest, BuildError> {
        Ok(ModelsOrderRequest {
            customer_id: self.customer_id.ok_or_else(|| BuildError::missing_field("customer_id"))?,
            ship_to: self.ship_to.ok_or_else(|| BuildError::missing_field("ship_to"))?,
            lines: self.lines.ok_or_else(|| BuildError::missing_field("lines"))?,
        })
    }
}
