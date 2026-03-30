pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BootInstanceRequest {
    #[serde(default)]
    pub size: String,
}

impl BootInstanceRequest {
    pub fn builder() -> BootInstanceRequestBuilder {
        <BootInstanceRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BootInstanceRequestBuilder {
    size: Option<String>,
}

impl BootInstanceRequestBuilder {
    pub fn size(mut self, value: impl Into<String>) -> Self {
        self.size = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BootInstanceRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`size`](BootInstanceRequestBuilder::size)
    pub fn build(self) -> Result<BootInstanceRequest, BuildError> {
        Ok(BootInstanceRequest {
            size: self.size.ok_or_else(|| BuildError::missing_field("size"))?,
        })
    }
}
