pub use crate::prelude::*;

/// Represents an identity provider connection
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Connection {
    /// Connection identifier
    pub id: String,
    /// Connection name
    pub name: String,
    /// Display name for the connection
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    /// The identity provider identifier (auth0, google-oauth2, facebook, etc.)
    pub strategy: String,
    /// Connection-specific configuration options
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<HashMap<String, serde_json::Value>>,
    /// List of client IDs that can use this connection
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled_clients: Option<Vec<String>>,
    /// Applicable realms for enterprise connections
    #[serde(skip_serializing_if = "Option::is_none")]
    pub realms: Option<Vec<String>>,
    /// Whether this is a domain connection
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_domain_connection: Option<bool>,
    /// Additional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}