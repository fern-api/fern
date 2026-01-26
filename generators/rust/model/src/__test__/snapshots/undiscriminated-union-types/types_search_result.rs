pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SearchResult {
        #[serde(rename = "user")]
        User {
            #[serde(flatten)]
            data: User,
        },

        #[serde(rename = "product")]
        Product {
            #[serde(flatten)]
            data: Product,
        },

        #[serde(rename = "category")]
        Category {
            #[serde(flatten)]
            data: Category,
        },
}
