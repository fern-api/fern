pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Cat {
    pub fruit: Box<Fruit>,
}
