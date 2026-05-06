pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubmitFormDataRequest {
    /// The user's username
    #[serde(default)]
    pub username: String,
    /// The user's email address
    #[serde(default)]
    pub email: String,
}

impl SubmitFormDataRequest {
    pub fn builder() -> SubmitFormDataRequestBuilder {
        <SubmitFormDataRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmitFormDataRequestBuilder {
    username: Option<String>,
    email: Option<String>,
}

impl SubmitFormDataRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SubmitFormDataRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](SubmitFormDataRequestBuilder::username)
    /// - [`email`](SubmitFormDataRequestBuilder::email)
    pub fn build(self) -> Result<SubmitFormDataRequest, BuildError> {
        Ok(SubmitFormDataRequest {
            username: self
                .username
                .ok_or_else(|| BuildError::missing_field("username"))?,
            email: self
                .email
                .ok_or_else(|| BuildError::missing_field("email"))?,
        })
    }
}
