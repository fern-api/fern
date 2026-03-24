pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUsernameBodyOptionalProperties {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl CreateUsernameBodyOptionalProperties {
    pub fn builder() -> CreateUsernameBodyOptionalPropertiesBuilder {
        CreateUsernameBodyOptionalPropertiesBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUsernameBodyOptionalPropertiesBuilder {
    username: Option<String>,
    password: Option<String>,
    name: Option<String>,
}

impl CreateUsernameBodyOptionalPropertiesBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateUsernameBodyOptionalProperties`].
    pub fn build(self) -> Result<CreateUsernameBodyOptionalProperties, BuildError> {
        Ok(CreateUsernameBodyOptionalProperties {
            username: self.username,
            password: self.password,
            name: self.name,
        })
    }
}
