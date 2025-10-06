pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2ProblemCustomFiles {
    Basic {
        #[serde(flatten)]
        data: V2ProblemBasicCustomFiles,
    },

    Custom {
        value: HashMap<CommonsLanguage, V2ProblemFiles>,
    },
}
