pub use crate::prelude::*;

/// Query parameters for getPlaylists
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetPlaylistsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    /// i'm another field
    #[serde(rename = "otherField")]
    #[serde(default)]
    pub other_field: String,
    /// I'm a multiline
    /// description
    #[serde(rename = "multiLineDocs")]
    #[serde(default)]
    pub multi_line_docs: String,
    #[serde(rename = "optionalMultipleField")]
    #[serde(default)]
    pub optional_multiple_field: Vec<Option<String>>,
    #[serde(rename = "multipleField")]
    #[serde(default)]
    pub multiple_field: Vec<String>,
}

impl GetPlaylistsQueryRequest {
    pub fn builder() -> GetPlaylistsQueryRequestBuilder {
        <GetPlaylistsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetPlaylistsQueryRequestBuilder {
    limit: Option<i64>,
    other_field: Option<String>,
    multi_line_docs: Option<String>,
    optional_multiple_field: Option<Vec<Option<String>>>,
    multiple_field: Option<Vec<String>>,
}

impl GetPlaylistsQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn other_field(mut self, value: impl Into<String>) -> Self {
        self.other_field = Some(value.into());
        self
    }

    pub fn multi_line_docs(mut self, value: impl Into<String>) -> Self {
        self.multi_line_docs = Some(value.into());
        self
    }

    pub fn optional_multiple_field(mut self, value: Vec<Option<String>>) -> Self {
        self.optional_multiple_field = Some(value);
        self
    }

    pub fn multiple_field(mut self, value: Vec<String>) -> Self {
        self.multiple_field = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetPlaylistsQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`other_field`](GetPlaylistsQueryRequestBuilder::other_field)
    /// - [`multi_line_docs`](GetPlaylistsQueryRequestBuilder::multi_line_docs)
    /// - [`optional_multiple_field`](GetPlaylistsQueryRequestBuilder::optional_multiple_field)
    /// - [`multiple_field`](GetPlaylistsQueryRequestBuilder::multiple_field)
    pub fn build(self) -> Result<GetPlaylistsQueryRequest, BuildError> {
        Ok(GetPlaylistsQueryRequest {
            limit: self.limit,
            other_field: self
                .other_field
                .ok_or_else(|| BuildError::missing_field("other_field"))?,
            multi_line_docs: self
                .multi_line_docs
                .ok_or_else(|| BuildError::missing_field("multi_line_docs"))?,
            optional_multiple_field: self
                .optional_multiple_field
                .ok_or_else(|| BuildError::missing_field("optional_multiple_field"))?,
            multiple_field: self
                .multiple_field
                .ok_or_else(|| BuildError::missing_field("multiple_field"))?,
        })
    }
}
