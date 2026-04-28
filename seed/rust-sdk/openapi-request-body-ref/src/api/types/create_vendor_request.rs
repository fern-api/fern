pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateVendorRequest {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<String>,
}

impl CreateVendorRequest {
    pub fn builder() -> CreateVendorRequestBuilder {
        <CreateVendorRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateVendorRequestBuilder {
    name: Option<String>,
    address: Option<String>,
}

impl CreateVendorRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn address(mut self, value: impl Into<String>) -> Self {
        self.address = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateVendorRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CreateVendorRequestBuilder::name)
    pub fn build(self) -> Result<CreateVendorRequest, BuildError> {
        Ok(CreateVendorRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            address: self.address,
        })
    }
}
