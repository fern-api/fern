pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NoAudiencePayload {
    #[serde(default)]
    pub data: String,
}

impl NoAudiencePayload {
    pub fn builder() -> NoAudiencePayloadBuilder {
        <NoAudiencePayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NoAudiencePayloadBuilder {
    data: Option<String>,
}

impl NoAudiencePayloadBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NoAudiencePayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](NoAudiencePayloadBuilder::data)
    pub fn build(self) -> Result<NoAudiencePayload, BuildError> {
        Ok(NoAudiencePayload {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
