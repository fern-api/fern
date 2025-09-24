use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rectangle {
    pub width: f64,
    pub height: f64,
}