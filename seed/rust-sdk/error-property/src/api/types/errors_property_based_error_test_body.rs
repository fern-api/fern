pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PropertyBasedErrorTestBody {
    #[serde(default)]
    pub message: String,
}

impl PropertyBasedErrorTestBody {
    pub fn builder() -> PropertyBasedErrorTestBodyBuilder {
        PropertyBasedErrorTestBodyBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PropertyBasedErrorTestBodyBuilder {
    message: Option<String>,
}

impl PropertyBasedErrorTestBodyBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PropertyBasedErrorTestBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](PropertyBasedErrorTestBodyBuilder::message)
    pub fn build(self) -> Result<PropertyBasedErrorTestBody, BuildError> {
        Ok(PropertyBasedErrorTestBody {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
