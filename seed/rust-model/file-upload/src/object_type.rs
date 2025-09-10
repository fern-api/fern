use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ObjectType {
    #[serde(rename = "FOO")]
    Foo,
    #[serde(rename = "BAR")]
    Bar,
}