use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Product {
    pub id: String,
    pub title: String,
    pub price: f64,
    pub in_stock: bool,
}