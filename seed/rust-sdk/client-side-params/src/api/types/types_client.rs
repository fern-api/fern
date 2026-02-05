pub use crate::prelude::*;

/// Represents a client application
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Client {
    /// The unique client identifier
    pub client_id: String,
    /// The tenant name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tenant: Option<String>,
    /// Name of the client
    pub name: String,
    /// Free text description of the client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Whether this is a global client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub global: Option<bool>,
    /// The client secret (only for non-public clients)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_secret: Option<String>,
    /// The type of application (spa, native, regular_web, non_interactive)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<String>,
    /// URL of the client logo
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_uri: Option<String>,
    /// Whether this client is a first party client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_first_party: Option<bool>,
    /// Whether this client conforms to OIDC specifications
    #[serde(skip_serializing_if = "Option::is_none")]
    pub oidc_conformant: Option<bool>,
    /// Allowed callback URLs
    #[serde(skip_serializing_if = "Option::is_none")]
    pub callbacks: Option<Vec<String>>,
    /// Allowed origins for CORS
    #[serde(skip_serializing_if = "Option::is_none")]
    pub allowed_origins: Option<Vec<String>>,
    /// Allowed web origins for CORS
    #[serde(skip_serializing_if = "Option::is_none")]
    pub web_origins: Option<Vec<String>>,
    /// Allowed grant types
    #[serde(skip_serializing_if = "Option::is_none")]
    pub grant_types: Option<Vec<String>>,
    /// JWT configuration for the client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jwt_configuration: Option<HashMap<String, serde_json::Value>>,
    /// Client signing keys
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signing_keys: Option<Vec<HashMap<String, serde_json::Value>>>,
    /// Encryption key
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encryption_key: Option<HashMap<String, serde_json::Value>>,
    /// Whether SSO is enabled
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sso: Option<bool>,
    /// Whether SSO is disabled
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sso_disabled: Option<bool>,
    /// Whether to use cross-origin authentication
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cross_origin_auth: Option<bool>,
    /// URL for cross-origin authentication
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cross_origin_loc: Option<String>,
    /// Whether a custom login page is enabled
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page_on: Option<bool>,
    /// Custom login page URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page: Option<String>,
    /// Custom login page preview URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page_preview: Option<String>,
    /// Form template for WS-Federation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub form_template: Option<String>,
    /// Whether this is a Heroku application
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_heroku_app: Option<bool>,
    /// Addons enabled for this client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub addons: Option<HashMap<String, serde_json::Value>>,
    /// Requested authentication method for the token endpoint
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token_endpoint_auth_method: Option<String>,
    /// Metadata associated with the client
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_metadata: Option<HashMap<String, serde_json::Value>>,
    /// Mobile app settings
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mobile: Option<HashMap<String, serde_json::Value>>,
}