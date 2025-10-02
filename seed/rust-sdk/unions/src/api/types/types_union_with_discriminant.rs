use crate::types_bar::Bar;
use crate::types_foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum UnionWithDiscriminant {
    Foo { foo: Foo },

    Bar { bar: Bar },
}
