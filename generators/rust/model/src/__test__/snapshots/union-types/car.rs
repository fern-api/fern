use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Car {
    pub doors: i32,
    pub fuel_type: String,
}