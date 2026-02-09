pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSingleElement {
        #[serde(rename = "foo")]
        Foo {
            #[serde(flatten)]
            data: Foo,
        },
}
