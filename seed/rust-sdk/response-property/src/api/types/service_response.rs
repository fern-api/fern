pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Response {
    #[serde(flatten)]
    pub with_metadata_fields: WithMetadata,
    #[serde(flatten)]
    pub with_docs_fields: WithDocs,
    #[serde(default)]
    pub data: Movie,
}

impl Response {
    pub fn builder() -> ResponseBuilder {
        ResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResponseBuilder {
    with_metadata_fields: Option<WithMetadata>,
    with_docs_fields: Option<WithDocs>,
    data: Option<Movie>,
}

impl ResponseBuilder {
    pub fn with_metadata_fields(mut self, value: WithMetadata) -> Self {
        self.with_metadata_fields = Some(value);
        self
    }

    pub fn with_docs_fields(mut self, value: WithDocs) -> Self {
        self.with_docs_fields = Some(value);
        self
    }

    pub fn data(mut self, value: Movie) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Response`].
    /// This method will fail if any of the following fields are not set:
    /// - [`with_metadata_fields`](ResponseBuilder::with_metadata_fields)
    /// - [`with_docs_fields`](ResponseBuilder::with_docs_fields)
    /// - [`data`](ResponseBuilder::data)
    pub fn build(self) -> Result<Response, BuildError> {
        Ok(Response {
            with_metadata_fields: self
                .with_metadata_fields
                .ok_or_else(|| BuildError::missing_field("with_metadata_fields"))?,
            with_docs_fields: self
                .with_docs_fields
                .ok_or_else(|| BuildError::missing_field("with_docs_fields"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
