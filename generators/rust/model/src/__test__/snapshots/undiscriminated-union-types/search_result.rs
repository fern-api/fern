use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SearchResult {
        User {
            #[serde(flatten)]
            data: User,
        },

        Product {
            #[serde(flatten)]
            data: Product,
        },

        Category {
            #[serde(flatten)]
            data: Category,
        },
}
