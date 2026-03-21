pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SearchResult {
        #[serde(rename = "user")]
        #[non_exhaustive]
        User {
            #[serde(default)]
            id: String,
            #[serde(default)]
            name: String,
            #[serde(default)]
            email: String,
        },

        #[serde(rename = "product")]
        #[non_exhaustive]
        Product {
            #[serde(default)]
            id: String,
            #[serde(default)]
            title: String,
            #[serde(default)]
            price: f64,
            #[serde(default)]
            in_stock: bool,
        },

        #[serde(rename = "category")]
        #[non_exhaustive]
        Category {
            #[serde(default)]
            id: String,
            #[serde(default)]
            name: String,
            #[serde(default)]
            description: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            parent_id: Option<String>,
        },
}

impl SearchResult {
    pub fn user(id: String, name: String, email: String) -> Self {
        Self::User { id, name, email }
    }

    pub fn product(id: String, title: String, price: f64, in_stock: bool) -> Self {
        Self::Product { id, title, price, in_stock }
    }

    pub fn category(id: String, name: String, description: String) -> Self {
        Self::Category { id, name, description, parent_id: None }
    }
}
