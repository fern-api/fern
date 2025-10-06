pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TypesSearchResult {
        User {
            #[serde(flatten)]
            data: TypesUser,
        },

        Product {
            #[serde(flatten)]
            data: TypesProduct,
        },

        Category {
            #[serde(flatten)]
            data: TypesCategory,
        },
}
