pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2V3ProblemCustomFiles {
    Basic {
        #[serde(flatten)]
        data: V2V3ProblemBasicCustomFiles,
    },

    Custom {
        value: HashMap<Language, V2V3ProblemFiles>,
    },
}
