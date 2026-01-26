pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicateTypes {
        #[serde(rename = "foo1")]
        Foo1 {
            #[serde(flatten)]
            data: Foo,
        },

        #[serde(rename = "foo2")]
        Foo2 {
            #[serde(flatten)]
            data: Foo,
        },
}
