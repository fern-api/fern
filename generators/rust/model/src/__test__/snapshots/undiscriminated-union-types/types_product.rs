pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesProduct {
    pub id: String,
    pub title: String,
    pub price: f64,
    pub in_stock: bool,
}