use crate::foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithMultipleNoProperties {
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        Empty1,

        Empty2,
}
