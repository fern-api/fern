pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateVendorRequest {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<UpdateVendorRequestStatus>,
}

impl UpdateVendorRequest {
    pub fn builder() -> UpdateVendorRequestBuilder {
        <UpdateVendorRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateVendorRequestBuilder {
    name: Option<String>,
    status: Option<UpdateVendorRequestStatus>,
}

impl UpdateVendorRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn status(mut self, value: UpdateVendorRequestStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdateVendorRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UpdateVendorRequestBuilder::name)
    pub fn build(self) -> Result<UpdateVendorRequest, BuildError> {
        Ok(UpdateVendorRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            status: self.status,
        })
    }
}
