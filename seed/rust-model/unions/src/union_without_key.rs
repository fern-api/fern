use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
