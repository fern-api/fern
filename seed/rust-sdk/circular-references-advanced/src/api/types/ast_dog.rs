pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dog {
    pub fruit: Box<Fruit>,
}
