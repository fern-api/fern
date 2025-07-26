use crate::dog::Dog;
use crate::cat::Cat;
use crate::bird::Bird;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Animal {
        Dog {
            #[serde(flatten)]
            data: Dog,
        },

        Cat {
            #[serde(flatten)]
            data: Cat,
        },

        Bird {
            #[serde(flatten)]
            data: Bird,
        },
}
