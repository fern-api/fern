pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateProfileIdentifierResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl UpdateProfileIdentifierResponse {
    pub fn builder() -> UpdateProfileIdentifierResponseBuilder {
        <UpdateProfileIdentifierResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateProfileIdentifierResponseBuilder {
    message: Option<String>,
}

impl UpdateProfileIdentifierResponseBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UpdateProfileIdentifierResponse`].
    pub fn build(self) -> Result<UpdateProfileIdentifierResponse, BuildError> {
        Ok(UpdateProfileIdentifierResponse {
            message: self.message,
        })
    }
}
