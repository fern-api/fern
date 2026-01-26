pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Animal {
        #[serde(rename = "dog")]
        Dog {
            #[serde(flatten)]
            data: Dog,
        },

        #[serde(rename = "cat")]
        Cat {
            #[serde(flatten)]
            data: Cat,
        },

        #[serde(rename = "bird")]
        Bird {
            #[serde(flatten)]
            data: Bird,
        },
}
