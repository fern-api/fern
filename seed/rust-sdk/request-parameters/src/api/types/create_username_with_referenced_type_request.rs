pub use crate::prelude::*;

/// Request for createUsernameWithReferencedType (body + query parameters)
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUsernameWithReferencedTypeRequest {
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub body: CreateUsernameBody,
}

impl CreateUsernameWithReferencedTypeRequest {
    pub fn builder() -> CreateUsernameWithReferencedTypeRequestBuilder {
        CreateUsernameWithReferencedTypeRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUsernameWithReferencedTypeRequestBuilder {
    tags: Option<Vec<String>>,
    body: Option<CreateUsernameBody>,
}

impl CreateUsernameWithReferencedTypeRequestBuilder {
    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn body(mut self, value: CreateUsernameBody) -> Self {
        self.body = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateUsernameWithReferencedTypeRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tags`](CreateUsernameWithReferencedTypeRequestBuilder::tags)
    /// - [`body`](CreateUsernameWithReferencedTypeRequestBuilder::body)
    pub fn build(self) -> Result<CreateUsernameWithReferencedTypeRequest, BuildError> {
        Ok(CreateUsernameWithReferencedTypeRequest {
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
        })
    }
}
