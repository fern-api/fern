pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Media {
    #[serde(default)]
    pub id: String,
    #[serde(rename = "contentType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_type: Option<String>,
}

impl Media {
    pub fn builder() -> MediaBuilder {
        <MediaBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MediaBuilder {
    id: Option<String>,
    content_type: Option<String>,
}

impl MediaBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn content_type(mut self, value: impl Into<String>) -> Self {
        self.content_type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Media`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MediaBuilder::id)
    pub fn build(self) -> Result<Media, BuildError> {
        Ok(Media {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            content_type: self.content_type,
        })
    }
}
