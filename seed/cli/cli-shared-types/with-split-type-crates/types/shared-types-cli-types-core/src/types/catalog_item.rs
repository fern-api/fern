pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CatalogItem {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub price: Money,
}

impl CatalogItem {
    pub fn builder() -> CatalogItemBuilder {
        <CatalogItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CatalogItemBuilder {
    id: Option<String>,
    name: Option<String>,
    price: Option<Money>,
}

impl CatalogItemBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn price(mut self, value: Money) -> Self {
        self.price = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CatalogItem`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CatalogItemBuilder::id)
    /// - [`name`](CatalogItemBuilder::name)
    /// - [`price`](CatalogItemBuilder::price)
    pub fn build(self) -> Result<CatalogItem, BuildError> {
        Ok(CatalogItem {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            price: self.price.ok_or_else(|| BuildError::missing_field("price"))?,
        })
    }
}
