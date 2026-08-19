pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AuthorizeResponse {
    #[serde(default)]
    pub code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
}

impl AuthorizeResponse {
    pub fn builder() -> AuthorizeResponseBuilder {
        <AuthorizeResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthorizeResponseBuilder {
    code: Option<String>,
    state: Option<String>,
}

impl AuthorizeResponseBuilder {
    pub fn code(mut self, value: impl Into<String>) -> Self {
        self.code = Some(value.into());
        self
    }

    pub fn state(mut self, value: impl Into<String>) -> Self {
        self.state = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthorizeResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`code`](AuthorizeResponseBuilder::code)
    pub fn build(self) -> Result<AuthorizeResponse, BuildError> {
        Ok(AuthorizeResponse {
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
            state: self.state,
        })
    }
}
