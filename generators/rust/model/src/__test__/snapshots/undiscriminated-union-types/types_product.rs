pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Product {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub price: f64,
    #[serde(default)]
    pub in_stock: bool,
}

impl Product {
    pub fn builder() -> ProductBuilder {
        ProductBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProductBuilder {
    id: Option<String>,
    title: Option<String>,
    price: Option<f64>,
    in_stock: Option<bool>,
}

impl ProductBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn price(mut self, value: f64) -> Self {
        self.price = Some(value);
        self
    }

    pub fn in_stock(mut self, value: bool) -> Self {
        self.in_stock = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Product`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ProductBuilder::id)
    /// - [`title`](ProductBuilder::title)
    /// - [`price`](ProductBuilder::price)
    /// - [`in_stock`](ProductBuilder::in_stock)
    pub fn build(self) -> Result<Product, BuildError> {
        Ok(Product {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            title: self.title.ok_or_else(|| BuildError::missing_field("title"))?,
            price: self.price.ok_or_else(|| BuildError::missing_field("price"))?,
            in_stock: self.in_stock.ok_or_else(|| BuildError::missing_field("in_stock"))?,
        })
    }
}
