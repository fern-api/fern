pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithDuplicateTypes {
    Foo1 {
        #[serde(flatten)]
        data: TypesFoo,
    },

    Foo2 {
        #[serde(flatten)]
        data: TypesFoo,
    },
}
