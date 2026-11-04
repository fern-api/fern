pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateShipmentsRequestItemsItem {
    #[serde(default)]
    pub sku: String,
    #[serde(default)]
    pub quantity: i64,
}

impl CreateShipmentsRequestItemsItem {
    pub fn builder() -> CreateShipmentsRequestItemsItemBuilder {
        <CreateShipmentsRequestItemsItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateShipmentsRequestItemsItemBuilder {
    sku: Option<String>,
    quantity: Option<i64>,
}

impl CreateShipmentsRequestItemsItemBuilder {
    pub fn sku(mut self, value: impl Into<String>) -> Self {
        self.sku = Some(value.into());
        self
    }

    pub fn quantity(mut self, value: i64) -> Self {
        self.quantity = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateShipmentsRequestItemsItem`].
    /// This method will fail if any of the following fields are not set:
    /// - [`sku`](CreateShipmentsRequestItemsItemBuilder::sku)
    /// - [`quantity`](CreateShipmentsRequestItemsItemBuilder::quantity)
    pub fn build(self) -> Result<CreateShipmentsRequestItemsItem, BuildError> {
        Ok(CreateShipmentsRequestItemsItem {
            sku: self.sku.ok_or_else(|| BuildError::missing_field("sku"))?,
            quantity: self.quantity.ok_or_else(|| BuildError::missing_field("quantity"))?,
        })
    }
}
