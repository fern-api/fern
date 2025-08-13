use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Foo {
    pub bar_property: uuid::Uuid,
}f = "Option::is_none")]
    pub foo: Option<Foo>,
}