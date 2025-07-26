use crate::foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSingleElement {
        Foo {
            #[serde(flatten)]
            data: Foo,
        },
}
