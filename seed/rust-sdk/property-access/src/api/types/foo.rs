use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Foo {
    pub normal: String,
    pub read: String,
    pub write: String,
}
