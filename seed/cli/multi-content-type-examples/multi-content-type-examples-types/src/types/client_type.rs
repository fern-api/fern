pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Client {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
}

impl Client {
    pub fn builder() -> ClientBuilder {
        <ClientBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ClientBuilder {
    name: Option<String>,
    email: Option<String>,
}

impl ClientBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Client`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](ClientBuilder::name)
    /// - [`email`](ClientBuilder::email)
    pub fn build(self) -> Result<Client, BuildError> {
        Ok(Client {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
        })
    }
}
