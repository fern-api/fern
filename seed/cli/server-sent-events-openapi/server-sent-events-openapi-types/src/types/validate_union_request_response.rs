pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ValidateUnionRequestResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub valid: Option<bool>,
}

impl ValidateUnionRequestResponse {
    pub fn builder() -> ValidateUnionRequestResponseBuilder {
        <ValidateUnionRequestResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ValidateUnionRequestResponseBuilder {
    valid: Option<bool>,
}

impl ValidateUnionRequestResponseBuilder {
    pub fn valid(mut self, value: bool) -> Self {
        self.valid = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ValidateUnionRequestResponse`].
    pub fn build(self) -> Result<ValidateUnionRequestResponse, BuildError> {
        Ok(ValidateUnionRequestResponse {
            valid: self.valid,
        })
    }
}
