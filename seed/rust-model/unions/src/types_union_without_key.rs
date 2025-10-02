use crate::types_foo::Foo;
use crate::types_bar::Bar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
