pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StringResponse {
    #[serde(default)]
    pub data: String,
}

impl StringResponse {
    pub fn builder() -> StringResponseBuilder {
        <StringResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StringResponseBuilder {
    data: Option<String>,
}

impl StringResponseBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StringResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](StringResponseBuilder::data)
    pub fn build(self) -> Result<StringResponse, BuildError> {
        Ok(StringResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
