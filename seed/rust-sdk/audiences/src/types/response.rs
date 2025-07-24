use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Response {
    pub foo: String,
}lizing_if = "Option::is_none")]
    pub foo: Option<Foo>,
}