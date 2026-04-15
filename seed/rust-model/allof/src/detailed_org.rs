pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DetailedOrg {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<DetailedOrgMetadata>,
}

impl DetailedOrg {
    pub fn builder() -> DetailedOrgBuilder {
        <DetailedOrgBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DetailedOrgBuilder {
    metadata: Option<DetailedOrgMetadata>,
}

impl DetailedOrgBuilder {
    pub fn metadata(mut self, value: DetailedOrgMetadata) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DetailedOrg`].
    pub fn build(self) -> Result<DetailedOrg, BuildError> {
        Ok(DetailedOrg {
            metadata: self.metadata,
        })
    }
}
