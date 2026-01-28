pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithMultipleNoProperties {
        #[serde(rename = "foo")]
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        #[serde(rename = "empty1")]
        Empty1,

        #[serde(rename = "empty2")]
        Empty2,
}
