pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BaseOrgMetadata {
    /// Deployment region from BaseOrg.
    #[serde(default)]
    pub region: String,
    /// Subscription tier.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tier: Option<String>,
}

impl BaseOrgMetadata {
    pub fn builder() -> BaseOrgMetadataBuilder {
        <BaseOrgMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BaseOrgMetadataBuilder {
    region: Option<String>,
    tier: Option<String>,
}

impl BaseOrgMetadataBuilder {
    pub fn region(mut self, value: impl Into<String>) -> Self {
        self.region = Some(value.into());
        self
    }

    pub fn tier(mut self, value: impl Into<String>) -> Self {
        self.tier = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BaseOrgMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`region`](BaseOrgMetadataBuilder::region)
    pub fn build(self) -> Result<BaseOrgMetadata, BuildError> {
        Ok(BaseOrgMetadata {
            region: self.region.ok_or_else(|| BuildError::missing_field("region"))?,
            tier: self.tier,
        })
    }
}
