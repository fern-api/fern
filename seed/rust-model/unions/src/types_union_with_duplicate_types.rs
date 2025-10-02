use crate::types_foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
