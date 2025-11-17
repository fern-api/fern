pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithMultipleNoProperties {
    Foo {
        #[serde(flatten)]
        data: Foo,
    },

    Empty1,

    Empty2,
}
