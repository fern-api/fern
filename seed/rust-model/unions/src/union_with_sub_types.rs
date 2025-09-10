use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
