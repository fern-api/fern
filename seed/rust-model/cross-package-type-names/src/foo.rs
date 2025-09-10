use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Foo {
    pub bar_property: uuid::Uuid,
})]
    pub foo: Option<Foo>,
}