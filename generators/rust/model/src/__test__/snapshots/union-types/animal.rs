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
