pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithMultipleNoProperties {
    Foo {
        #[serde(flatten)]
        data: TypesFoo,
    },

    Empty1,

    Empty2,
}
