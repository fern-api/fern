pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
