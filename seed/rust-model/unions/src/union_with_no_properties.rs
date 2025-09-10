use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithNoProperties {
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        Empty,
}
