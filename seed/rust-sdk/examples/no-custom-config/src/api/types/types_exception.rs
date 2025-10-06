pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesException {
    Generic {
        #[serde(flatten)]
        data: TypesExceptionInfo,
    },

    Timeout,
}
