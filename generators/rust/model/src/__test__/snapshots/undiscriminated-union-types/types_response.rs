pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesResponse {
        Success {
            #[serde(flatten)]
            data: TypesSuccessResponse,
        },

        Error {
            #[serde(flatten)]
            data: TypesErrorResponse,
        },
}
