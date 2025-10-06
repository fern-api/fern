pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesFooExtended {
    #[serde(flatten)]
    pub foo_fields: TypesFoo,
    pub age: i64,
}
