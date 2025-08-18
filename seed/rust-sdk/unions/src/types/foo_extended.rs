use crate::foo::Foo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FooExtended {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub age: i32,
}