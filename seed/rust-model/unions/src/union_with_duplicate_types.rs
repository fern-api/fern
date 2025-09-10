use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithDuplicateTypes {
        Foo1 {
            #[serde(flatten)]
            data: Foo,
        },

        Foo2 {
            #[serde(flatten)]
            data: Foo,
        },
}
