use crate::types_dog::Dog;
use crate::types_cat::Cat;
use crate::types_bird::Bird;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
