pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    #[serde(rename = "_type")]
    pub r#type: String,
    #[serde(rename = "_version")]
    pub version: String,
    #[serde(default)]
    pub name: String,
}

impl CreateUserRequest {
    pub fn builder() -> CreateUserRequestBuilder {
        <CreateUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUserRequestBuilder {
    r#type: Option<String>,
    version: Option<String>,
    name: Option<String>,
}

impl CreateUserRequestBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn version(mut self, value: impl Into<String>) -> Self {
        self.version = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](CreateUserRequestBuilder::r#type)
    /// - [`version`](CreateUserRequestBuilder::version)
    /// - [`name`](CreateUserRequestBuilder::name)
    pub fn build(self) -> Result<CreateUserRequest, BuildError> {
        Ok(CreateUserRequest {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            version: self.version.ok_or_else(|| BuildError::missing_field("version"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}

