use crate::types_union__dog::Dog;
use crate::types_union__cat::Cat;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "animal")]
pub enum Animal {
        Dog {
            #[serde(flatten)]
            data: Dog,
        },

        Cat {
            #[serde(flatten)]
            data: Cat,
        },
}
