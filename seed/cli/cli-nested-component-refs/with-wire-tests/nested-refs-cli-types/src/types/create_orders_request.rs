pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrdersRequest {
    #[serde(rename = "customerId")]
    #[serde(default)]
    pub customer_id: String,
    #[serde(rename = "shipTo")]
    #[serde(default)]
    pub ship_to: CreateOrdersRequestShipTo,
    #[serde(default)]
    pub lines: Vec<CreateOrdersRequestLinesItem>,
}

impl CreateOrdersRequest {
    pub fn builder() -> CreateOrdersRequestBuilder {
        <CreateOrdersRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateOrdersRequestBuilder {
    customer_id: Option<String>,
    ship_to: Option<CreateOrdersRequestShipTo>,
    lines: Option<Vec<CreateOrdersRequestLinesItem>>,
}

impl CreateOrdersRequestBuilder {
    pub fn customer_id(mut self, value: impl Into<String>) -> Self {
        self.customer_id = Some(value.into());
        self
    }

    pub fn ship_to(mut self, value: CreateOrdersRequestShipTo) -> Self {
        self.ship_to = Some(value);
        self
    }

    pub fn lines(mut self, value: Vec<CreateOrdersRequestLinesItem>) -> Self {
        self.lines = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateOrdersRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`customer_id`](CreateOrdersRequestBuilder::customer_id)
    /// - [`ship_to`](CreateOrdersRequestBuilder::ship_to)
    /// - [`lines`](CreateOrdersRequestBuilder::lines)
    pub fn build(self) -> Result<CreateOrdersRequest, BuildError> {
        Ok(CreateOrdersRequest {
            customer_id: self.customer_id.ok_or_else(|| BuildError::missing_field("customer_id"))?,
            ship_to: self.ship_to.ok_or_else(|| BuildError::missing_field("ship_to"))?,
            lines: self.lines.ok_or_else(|| BuildError::missing_field("lines"))?,
        })
    }
}

