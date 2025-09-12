use crate::types_foo::Foo;
use crate::types_bar::Bar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Union {
        Foo {
            foo: Foo,
        },

        Bar {
            bar: Bar,
        },
}
