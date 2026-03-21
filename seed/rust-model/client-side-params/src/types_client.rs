pub use crate::prelude::*;

/// Represents a client application
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Client {
    /// The unique client identifier
    #[serde(default)]
    pub client_id: String,
    /// The tenant name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tenant: Option<String>,
    /// Name of the client
    #[serde(default)]
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

impl Client {
    pub fn builder() -> ClientBuilder {
        ClientBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ClientBuilder {
    client_id: Option<String>,
    tenant: Option<String>,
    name: Option<String>,
    description: Option<String>,
    global: Option<bool>,
    client_secret: Option<String>,
    app_type: Option<String>,
    logo_uri: Option<String>,
    is_first_party: Option<bool>,
    oidc_conformant: Option<bool>,
    callbacks: Option<Vec<String>>,
    allowed_origins: Option<Vec<String>>,
    web_origins: Option<Vec<String>>,
    grant_types: Option<Vec<String>>,
    jwt_configuration: Option<HashMap<String, serde_json::Value>>,
    signing_keys: Option<Vec<HashMap<String, serde_json::Value>>>,
    encryption_key: Option<HashMap<String, serde_json::Value>>,
    sso: Option<bool>,
    sso_disabled: Option<bool>,
    cross_origin_auth: Option<bool>,
    cross_origin_loc: Option<String>,
    custom_login_page_on: Option<bool>,
    custom_login_page: Option<String>,
    custom_login_page_preview: Option<String>,
    form_template: Option<String>,
    is_heroku_app: Option<bool>,
    addons: Option<HashMap<String, serde_json::Value>>,
    token_endpoint_auth_method: Option<String>,
    client_metadata: Option<HashMap<String, serde_json::Value>>,
    mobile: Option<HashMap<String, serde_json::Value>>,
}

impl ClientBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn tenant(mut self, value: impl Into<String>) -> Self {
        self.tenant = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: impl Into<String>) -> Self {
        self.description = Some(value.into());
        self
    }

    pub fn global(mut self, value: bool) -> Self {
        self.global = Some(value);
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    pub fn app_type(mut self, value: impl Into<String>) -> Self {
        self.app_type = Some(value.into());
        self
    }

    pub fn logo_uri(mut self, value: impl Into<String>) -> Self {
        self.logo_uri = Some(value.into());
        self
    }

    pub fn is_first_party(mut self, value: bool) -> Self {
        self.is_first_party = Some(value);
        self
    }

    pub fn oidc_conformant(mut self, value: bool) -> Self {
        self.oidc_conformant = Some(value);
        self
    }

    pub fn callbacks(mut self, value: Vec<String>) -> Self {
        self.callbacks = Some(value);
        self
    }

    pub fn allowed_origins(mut self, value: Vec<String>) -> Self {
        self.allowed_origins = Some(value);
        self
    }

    pub fn web_origins(mut self, value: Vec<String>) -> Self {
        self.web_origins = Some(value);
        self
    }

    pub fn grant_types(mut self, value: Vec<String>) -> Self {
        self.grant_types = Some(value);
        self
    }

    pub fn jwt_configuration(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.jwt_configuration = Some(value);
        self
    }

    pub fn signing_keys(mut self, value: Vec<HashMap<String, serde_json::Value>>) -> Self {
        self.signing_keys = Some(value);
        self
    }

    pub fn encryption_key(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.encryption_key = Some(value);
        self
    }

    pub fn sso(mut self, value: bool) -> Self {
        self.sso = Some(value);
        self
    }

    pub fn sso_disabled(mut self, value: bool) -> Self {
        self.sso_disabled = Some(value);
        self
    }

    pub fn cross_origin_auth(mut self, value: bool) -> Self {
        self.cross_origin_auth = Some(value);
        self
    }

    pub fn cross_origin_loc(mut self, value: impl Into<String>) -> Self {
        self.cross_origin_loc = Some(value.into());
        self
    }

    pub fn custom_login_page_on(mut self, value: bool) -> Self {
        self.custom_login_page_on = Some(value);
        self
    }

    pub fn custom_login_page(mut self, value: impl Into<String>) -> Self {
        self.custom_login_page = Some(value.into());
        self
    }

    pub fn custom_login_page_preview(mut self, value: impl Into<String>) -> Self {
        self.custom_login_page_preview = Some(value.into());
        self
    }

    pub fn form_template(mut self, value: impl Into<String>) -> Self {
        self.form_template = Some(value.into());
        self
    }

    pub fn is_heroku_app(mut self, value: bool) -> Self {
        self.is_heroku_app = Some(value);
        self
    }

    pub fn addons(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.addons = Some(value);
        self
    }

    pub fn token_endpoint_auth_method(mut self, value: impl Into<String>) -> Self {
        self.token_endpoint_auth_method = Some(value.into());
        self
    }

    pub fn client_metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.client_metadata = Some(value);
        self
    }

    pub fn mobile(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.mobile = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Client`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](ClientBuilder::client_id)
    /// - [`name`](ClientBuilder::name)
    pub fn build(self) -> Result<Client, BuildError> {
        Ok(Client {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            tenant: self.tenant,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self.description,
            global: self.global,
            client_secret: self.client_secret,
            app_type: self.app_type,
            logo_uri: self.logo_uri,
            is_first_party: self.is_first_party,
            oidc_conformant: self.oidc_conformant,
            callbacks: self.callbacks,
            allowed_origins: self.allowed_origins,
            web_origins: self.web_origins,
            grant_types: self.grant_types,
            jwt_configuration: self.jwt_configuration,
            signing_keys: self.signing_keys,
            encryption_key: self.encryption_key,
            sso: self.sso,
            sso_disabled: self.sso_disabled,
            cross_origin_auth: self.cross_origin_auth,
            cross_origin_loc: self.cross_origin_loc,
            custom_login_page_on: self.custom_login_page_on,
            custom_login_page: self.custom_login_page,
            custom_login_page_preview: self.custom_login_page_preview,
            form_template: self.form_template,
            is_heroku_app: self.is_heroku_app,
            addons: self.addons,
            token_endpoint_auth_method: self.token_endpoint_auth_method,
            client_metadata: self.client_metadata,
            mobile: self.mobile,
        })
    }
}
