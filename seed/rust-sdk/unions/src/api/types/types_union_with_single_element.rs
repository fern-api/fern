use crate::types_foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSingleElement {
    Foo {
        #[serde(flatten)]
        data: Foo,
    },
}
