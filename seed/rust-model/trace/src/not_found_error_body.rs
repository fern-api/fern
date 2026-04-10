pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NotFoundErrorBody {
    #[serde(rename = "errorName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_name: Option<NotFoundErrorBodyErrorName>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<PlaylistIdNotFoundErrorBody>,
}

impl NotFoundErrorBody {
    pub fn builder() -> NotFoundErrorBodyBuilder {
        <NotFoundErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NotFoundErrorBodyBuilder {
    error_name: Option<NotFoundErrorBodyErrorName>,
    content: Option<PlaylistIdNotFoundErrorBody>,
}

impl NotFoundErrorBodyBuilder {
    pub fn error_name(mut self, value: NotFoundErrorBodyErrorName) -> Self {
        self.error_name = Some(value);
        self
    }

    pub fn content(mut self, value: PlaylistIdNotFoundErrorBody) -> Self {
        self.content = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NotFoundErrorBody`].
    pub fn build(self) -> Result<NotFoundErrorBody, BuildError> {
        Ok(NotFoundErrorBody {
            error_name: self.error_name,
            content: self.content,
        })
    }
}
