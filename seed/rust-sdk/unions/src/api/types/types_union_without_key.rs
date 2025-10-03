pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithoutKey {
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    Bar {
        #[serde(flatten)]
        data: Bar,
    },
}
