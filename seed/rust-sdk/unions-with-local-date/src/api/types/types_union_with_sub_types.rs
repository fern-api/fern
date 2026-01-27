pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSubTypes {
        #[serde(rename = "foo")]
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        #[serde(rename = "fooExtended")]
        FooExtended {
            #[serde(flatten)]
            data: FooExtended,
        },
}
