pub use crate::prelude::*;

/// Nested object for testing
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Address {
    #[serde(default)]
    pub street: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
    #[serde(rename = "zipCode")]
    #[serde(default)]
    pub zip_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(rename = "buildingId")]
    #[serde(default)]
    pub building_id: NullableUserId,
    #[serde(rename = "tenantId")]
    #[serde(default)]
    pub tenant_id: OptionalUserId,
}

impl Address {
    pub fn builder() -> AddressBuilder {
        <AddressBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AddressBuilder {
    street: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip_code: Option<String>,
    country: Option<String>,
    building_id: Option<NullableUserId>,
    tenant_id: Option<OptionalUserId>,
}

impl AddressBuilder {
    pub fn street(mut self, value: impl Into<String>) -> Self {
        self.street = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    pub fn state(mut self, value: impl Into<String>) -> Self {
        self.state = Some(value.into());
        self
    }

    pub fn zip_code(mut self, value: impl Into<String>) -> Self {
        self.zip_code = Some(value.into());
        self
    }

    pub fn country(mut self, value: impl Into<String>) -> Self {
        self.country = Some(value.into());
        self
    }

    pub fn building_id(mut self, value: NullableUserId) -> Self {
        self.building_id = Some(value);
        self
    }

    pub fn tenant_id(mut self, value: OptionalUserId) -> Self {
        self.tenant_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Address`].
    /// This method will fail if any of the following fields are not set:
    /// - [`street`](AddressBuilder::street)
    /// - [`zip_code`](AddressBuilder::zip_code)
    /// - [`building_id`](AddressBuilder::building_id)
    /// - [`tenant_id`](AddressBuilder::tenant_id)
    pub fn build(self) -> Result<Address, BuildError> {
        Ok(Address {
            street: self
                .street
                .ok_or_else(|| BuildError::missing_field("street"))?,
            city: self.city,
            state: self.state,
            zip_code: self
                .zip_code
                .ok_or_else(|| BuildError::missing_field("zip_code"))?,
            country: self.country,
            building_id: self
                .building_id
                .ok_or_else(|| BuildError::missing_field("building_id"))?,
            tenant_id: self
                .tenant_id
                .ok_or_else(|| BuildError::missing_field("tenant_id"))?,
        })
    }
}
