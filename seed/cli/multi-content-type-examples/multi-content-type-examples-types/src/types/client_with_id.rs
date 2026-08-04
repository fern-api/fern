pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ClientWithId {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
}

impl ClientWithId {
    pub fn builder() -> ClientWithIdBuilder {
        <ClientWithIdBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ClientWithIdBuilder {
    id: Option<String>,
    name: Option<String>,
    email: Option<String>,
}

impl ClientWithIdBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ClientWithId`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ClientWithIdBuilder::id)
    /// - [`name`](ClientWithIdBuilder::name)
    /// - [`email`](ClientWithIdBuilder::email)
    pub fn build(self) -> Result<ClientWithId, BuildError> {
        Ok(ClientWithId {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
        })
    }
}
