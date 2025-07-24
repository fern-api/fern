use serde::{Deserialize, Serialize};
use crate::types::foo::Foo;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FooExtended {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub age: i32,
}