pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithoutKey {
        Foo {
            #[serde(flatten)]
            data: TypesFoo,
        },

        Bar {
            #[serde(flatten)]
            data: TypesBar,
        },
}
