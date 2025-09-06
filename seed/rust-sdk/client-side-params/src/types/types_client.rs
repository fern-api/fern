use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Client {
    pub client_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tenant: Option<String>,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub global: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_secret: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_first_party: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub oidc_conformant: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub callbacks: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub allowed_origins: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub web_origins: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub grant_types: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jwt_configuration: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signing_keys: Option<Vec<HashMap<String, serde_json::Value>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encryption_key: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sso: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sso_disabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cross_origin_auth: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cross_origin_loc: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page_on: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_login_page_preview: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub form_template: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_heroku_app: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub addons: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token_endpoint_auth_method: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mobile: Option<HashMap<String, serde_json::Value>>,
}