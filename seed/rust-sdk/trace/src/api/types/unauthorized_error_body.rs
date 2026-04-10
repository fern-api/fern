pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnauthorizedErrorBody {
    #[serde(rename = "errorName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_name: Option<UnauthorizedErrorBodyErrorName>,
}

impl UnauthorizedErrorBody {
    pub fn builder() -> UnauthorizedErrorBodyBuilder {
        <UnauthorizedErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnauthorizedErrorBodyBuilder {
    error_name: Option<UnauthorizedErrorBodyErrorName>,
}

impl UnauthorizedErrorBodyBuilder {
    pub fn error_name(mut self, value: UnauthorizedErrorBodyErrorName) -> Self {
        self.error_name = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnauthorizedErrorBody`].
    pub fn build(self) -> Result<UnauthorizedErrorBody, BuildError> {
        Ok(UnauthorizedErrorBody {
            error_name: self.error_name,
        })
    }
}
