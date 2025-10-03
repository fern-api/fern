use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetQueryRequest {
    pub decimal: f64,
    pub even: i64,
    pub name: String,
}
