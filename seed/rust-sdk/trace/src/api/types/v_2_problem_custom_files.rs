pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CustomFiles {
        #[serde(rename = "basic")]
        Basic {
            #[serde(flatten)]
            data: BasicCustomFiles,
        },

        #[serde(rename = "custom")]
        Custom {
            value: HashMap<Language, Files>,
        },
}
