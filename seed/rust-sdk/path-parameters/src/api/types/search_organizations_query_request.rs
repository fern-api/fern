pub use crate::prelude::*;

/// Query parameters for searchOrganizations
///
/// Request type for the SearchOrganizationsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchOrganizationsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}
