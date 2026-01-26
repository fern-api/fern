pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CustomFiles2 {
        #[serde(rename = "basic")]
        Basic {
            #[serde(flatten)]
            data: BasicCustomFiles2,
        },

        #[serde(rename = "custom")]
        Custom {
            value: HashMap<Language, Files2>,
        },
}
