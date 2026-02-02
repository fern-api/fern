pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "animal")]
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
}
