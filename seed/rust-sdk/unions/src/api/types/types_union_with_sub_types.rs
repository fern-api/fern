pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSubTypes {
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    FooExtended {
        #[serde(flatten)]
        data: FooExtended,
    },
}
