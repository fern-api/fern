pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Product {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub price: Option<f64>,
}

impl Product {
    pub fn builder() -> ProductBuilder {
        <ProductBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProductBuilder {
    id: Option<String>,
    name: Option<String>,
    price: Option<f64>,
}

impl ProductBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn price(mut self, value: f64) -> Self {
        self.price = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Product`].
    pub fn build(self) -> Result<Product, BuildError> {
        Ok(Product {
            id: self.id,
            name: self.name,
            price: self.price,
        })
    }
}
