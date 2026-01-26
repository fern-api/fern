pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Test {
        #[serde(rename = "and")]
        And {
            value: bool,
        },

        #[serde(rename = "or")]
        Or {
            value: bool,
        },
}
