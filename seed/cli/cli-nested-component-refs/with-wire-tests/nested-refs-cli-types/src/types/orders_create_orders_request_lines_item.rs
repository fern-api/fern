pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrdersRequestLinesItem {
    #[serde(default)]
    pub sku: String,
    #[serde(default)]
    pub quantity: i64,
}

impl CreateOrdersRequestLinesItem {
    pub fn builder() -> CreateOrdersRequestLinesItemBuilder {
        <CreateOrdersRequestLinesItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateOrdersRequestLinesItemBuilder {
    sku: Option<String>,
    quantity: Option<i64>,
}

impl CreateOrdersRequestLinesItemBuilder {
    pub fn sku(mut self, value: impl Into<String>) -> Self {
        self.sku = Some(value.into());
        self
    }

    pub fn quantity(mut self, value: i64) -> Self {
        self.quantity = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateOrdersRequestLinesItem`].
    /// This method will fail if any of the following fields are not set:
    /// - [`sku`](CreateOrdersRequestLinesItemBuilder::sku)
    /// - [`quantity`](CreateOrdersRequestLinesItemBuilder::quantity)
    pub fn build(self) -> Result<CreateOrdersRequestLinesItem, BuildError> {
        Ok(CreateOrdersRequestLinesItem {
            sku: self.sku.ok_or_else(|| BuildError::missing_field("sku"))?,
            quantity: self.quantity.ok_or_else(|| BuildError::missing_field("quantity"))?,
        })
    }
}
