use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Test {
        And {
            value: bool,
        },

        Or {
            value: bool,
        },
}
