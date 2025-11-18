pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithNoProperties {
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        Empty,
}
