pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum TypesUnionWithDiscriminant {
        Foo {
            foo: TypesFoo,
        },

        Bar {
            bar: TypesBar,
        },
}
