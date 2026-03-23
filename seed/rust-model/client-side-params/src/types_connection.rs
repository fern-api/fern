pub use crate::prelude::*;

/// Represents an identity provider connection
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Connection {
    /// Connection identifier
    #[serde(default)]
    pub id: String,
    /// Connection name
    #[serde(default)]
    pub name: String,
    /// Display name for the connection
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    /// The identity provider identifier (auth0, google-oauth2, facebook, etc.)
    #[serde(default)]
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

impl Connection {
    pub fn builder() -> ConnectionBuilder {
        ConnectionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ConnectionBuilder {
    id: Option<String>,
    name: Option<String>,
    display_name: Option<String>,
    strategy: Option<String>,
    options: Option<HashMap<String, serde_json::Value>>,
    enabled_clients: Option<Vec<String>>,
    realms: Option<Vec<String>>,
    is_domain_connection: Option<bool>,
    metadata: Option<HashMap<String, serde_json::Value>>,
}

impl ConnectionBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn display_name(mut self, value: impl Into<String>) -> Self {
        self.display_name = Some(value.into());
        self
    }

    pub fn strategy(mut self, value: impl Into<String>) -> Self {
        self.strategy = Some(value.into());
        self
    }

    pub fn options(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.options = Some(value);
        self
    }

    pub fn enabled_clients(mut self, value: Vec<String>) -> Self {
        self.enabled_clients = Some(value);
        self
    }

    pub fn realms(mut self, value: Vec<String>) -> Self {
        self.realms = Some(value);
        self
    }

    pub fn is_domain_connection(mut self, value: bool) -> Self {
        self.is_domain_connection = Some(value);
        self
    }

    pub fn metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Connection`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ConnectionBuilder::id)
    /// - [`name`](ConnectionBuilder::name)
    /// - [`strategy`](ConnectionBuilder::strategy)
    pub fn build(self) -> Result<Connection, BuildError> {
        Ok(Connection {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            display_name: self.display_name,
            strategy: self.strategy.ok_or_else(|| BuildError::missing_field("strategy"))?,
            options: self.options,
            enabled_clients: self.enabled_clients,
            realms: self.realms,
            is_domain_connection: self.is_domain_connection,
            metadata: self.metadata,
        })
    }
}
