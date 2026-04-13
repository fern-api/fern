pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserCreateUserRequest {
    #[serde(rename = "_type")]
    pub r#type: UserCreateUserRequestType,
    #[serde(rename = "_version")]
    pub version: UserCreateUserRequestVersion,
    #[serde(default)]
    pub name: String,
}

impl UserCreateUserRequest {
    pub fn builder() -> UserCreateUserRequestBuilder {
        <UserCreateUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserCreateUserRequestBuilder {
    r#type: Option<UserCreateUserRequestType>,
    version: Option<UserCreateUserRequestVersion>,
    name: Option<String>,
}

impl UserCreateUserRequestBuilder {
    pub fn r#type(mut self, value: UserCreateUserRequestType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn version(mut self, value: UserCreateUserRequestVersion) -> Self {
        self.version = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserCreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UserCreateUserRequestBuilder::r#type)
    /// - [`version`](UserCreateUserRequestBuilder::version)
    /// - [`name`](UserCreateUserRequestBuilder::name)
    pub fn build(self) -> Result<UserCreateUserRequest, BuildError> {
        Ok(UserCreateUserRequest {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            version: self.version.ok_or_else(|| BuildError::missing_field("version"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}

