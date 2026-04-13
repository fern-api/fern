pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BadRequestErrorBody {
    #[serde(rename = "errorName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_name: Option<BadRequestErrorBodyErrorName>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<PropertyBasedErrorTestBody>,
}

impl BadRequestErrorBody {
    pub fn builder() -> BadRequestErrorBodyBuilder {
        <BadRequestErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BadRequestErrorBodyBuilder {
    error_name: Option<BadRequestErrorBodyErrorName>,
    content: Option<PropertyBasedErrorTestBody>,
}

impl BadRequestErrorBodyBuilder {
    pub fn error_name(mut self, value: BadRequestErrorBodyErrorName) -> Self {
        self.error_name = Some(value);
        self
    }

    pub fn content(mut self, value: PropertyBasedErrorTestBody) -> Self {
        self.content = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BadRequestErrorBody`].
    pub fn build(self) -> Result<BadRequestErrorBody, BuildError> {
        Ok(BadRequestErrorBody {
            error_name: self.error_name,
            content: self.content,
        })
    }
}
