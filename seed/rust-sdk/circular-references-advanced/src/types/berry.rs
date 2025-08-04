use crate::animal::Animal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Berry {
    pub animal: Animal,
}