use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Record {
    pub foo: HashMap<String, String>,
    #[serde(rename = "3d")]
    pub 3_d: i32,
}