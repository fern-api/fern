pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelsLineItem {
    #[serde(default)]
    pub sku: String,
    #[serde(default)]
    pub quantity: i64,
}

impl ModelsLineItem {
    pub fn builder() -> ModelsLineItemBuilder {
        <ModelsLineItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsLineItemBuilder {
    sku: Option<String>,
    quantity: Option<i64>,
}

impl ModelsLineItemBuilder {
    pub fn sku(mut self, value: impl Into<String>) -> Self {
        self.sku = Some(value.into());
        self
    }

    pub fn quantity(mut self, value: i64) -> Self {
        self.quantity = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ModelsLineItem`].
    /// This method will fail if any of the following fields are not set:
    /// - [`sku`](ModelsLineItemBuilder::sku)
    /// - [`quantity`](ModelsLineItemBuilder::quantity)
    pub fn build(self) -> Result<ModelsLineItem, BuildError> {
        Ok(ModelsLineItem {
            sku: self.sku.ok_or_else(|| BuildError::missing_field("sku"))?,
            quantity: self.quantity.ok_or_else(|| BuildError::missing_field("quantity"))?,
        })
    }
}
