use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetQueryRequest {
    pub decimal: f64,
    pub even: i32,
    pub name: String,
}
