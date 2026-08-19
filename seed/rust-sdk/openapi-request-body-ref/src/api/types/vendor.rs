pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Vendor {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<VendorStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub update_request: Option<UpdateVendorRequest>,
}

impl Vendor {
    pub fn builder() -> VendorBuilder {
        <VendorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VendorBuilder {
    id: Option<String>,
    name: Option<String>,
    status: Option<VendorStatus>,
    update_request: Option<UpdateVendorRequest>,
}

impl VendorBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn status(mut self, value: VendorStatus) -> Self {
        self.status = Some(value);
        self
    }

    pub fn update_request(mut self, value: UpdateVendorRequest) -> Self {
        self.update_request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Vendor`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](VendorBuilder::id)
    /// - [`name`](VendorBuilder::name)
    pub fn build(self) -> Result<Vendor, BuildError> {
        Ok(Vendor {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            status: self.status,
            update_request: self.update_request,
        })
    }
}
