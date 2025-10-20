pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CustomFiles2 {
    Basic {
        #[serde(flatten)]
        data: BasicCustomFiles2,
    },

    Custom {
        value: HashMap<Language, Files2>,
    },
}
