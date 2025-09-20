use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Record {
    pub foo: HashMap<String, String>,
    #[serde(rename = "3d")]
    pub 3_d: i32,
}