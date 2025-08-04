use crate::fruit::Fruit;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dog {
    pub fruit: Fruit,
}