pub use crate::prelude::*;

/// Query parameters for listConnections
///
/// Request type for the ListConnectionsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListConnectionsQueryRequest {
    /// Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub strategy: Option<String>,
    /// Filter by connection name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}
