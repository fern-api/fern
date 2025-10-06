pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithSubTypes {
        Foo {
            #[serde(flatten)]
            data: TypesFoo,
        },

        FooExtended {
            #[serde(flatten)]
            data: TypesFooExtended,
        },
}
