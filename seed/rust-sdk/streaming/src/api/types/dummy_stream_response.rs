pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamResponse {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl StreamResponse {
    pub fn builder() -> StreamResponseBuilder {
        <StreamResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamResponseBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl StreamResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](StreamResponseBuilder::id)
    pub fn build(self) -> Result<StreamResponse, BuildError> {
        Ok(StreamResponse {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name,
        })
    }
}
