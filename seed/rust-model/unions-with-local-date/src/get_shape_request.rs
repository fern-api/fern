pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetShapeRequest {
    #[serde(default)]
    pub id: String,
}

impl GetShapeRequest {
    pub fn builder() -> GetShapeRequestBuilder {
        <GetShapeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetShapeRequestBuilder {
    id: Option<String>,
}

impl GetShapeRequestBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetShapeRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](GetShapeRequestBuilder::id)
    pub fn build(self) -> Result<GetShapeRequest, BuildError> {
        Ok(GetShapeRequest {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
