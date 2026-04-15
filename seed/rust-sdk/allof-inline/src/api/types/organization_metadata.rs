pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct OrganizationMetadata {
    /// Deployment region from DetailedOrg.
    #[serde(default)]
    pub region: String,
    /// Custom domain name.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub domain: Option<String>,
}

impl OrganizationMetadata {
    pub fn builder() -> OrganizationMetadataBuilder {
        <OrganizationMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrganizationMetadataBuilder {
    region: Option<String>,
    domain: Option<String>,
}

impl OrganizationMetadataBuilder {
    pub fn region(mut self, value: impl Into<String>) -> Self {
        self.region = Some(value.into());
        self
    }

    pub fn domain(mut self, value: impl Into<String>) -> Self {
        self.domain = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`OrganizationMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`region`](OrganizationMetadataBuilder::region)
    pub fn build(self) -> Result<OrganizationMetadata, BuildError> {
        Ok(OrganizationMetadata {
            region: self
                .region
                .ok_or_else(|| BuildError::missing_field("region"))?,
            domain: self.domain,
        })
    }
}
