pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithNoProperties {
        Foo {
            #[serde(flatten)]
            data: TypesFoo,
        },

        Empty,
}
