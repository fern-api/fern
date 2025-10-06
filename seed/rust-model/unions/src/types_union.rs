pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnion {
        Foo {
            foo: TypesFoo,
        },

        Bar {
            bar: TypesBar,
        },
}
