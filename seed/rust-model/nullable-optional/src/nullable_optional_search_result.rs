pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum NullableOptionalSearchResult {
        User {
            #[serde(flatten)]
            data: NullableOptionalUserResponse,
        },

        Organization {
            #[serde(flatten)]
            data: NullableOptionalOrganization,
        },

        Document {
            #[serde(flatten)]
            data: NullableOptionalDocument,
        },
}
