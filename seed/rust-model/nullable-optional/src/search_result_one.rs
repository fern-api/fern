pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SearchResultOne {
    #[serde(flatten)]
    pub organization_fields: Organization,
    pub r#type: SearchResultOneType,
}

impl SearchResultOne {
    pub fn builder() -> SearchResultOneBuilder {
        <SearchResultOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchResultOneBuilder {
    organization_fields: Option<Organization>,
    r#type: Option<SearchResultOneType>,
}

impl SearchResultOneBuilder {
    pub fn organization_fields(mut self, value: Organization) -> Self {
        self.organization_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SearchResultOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchResultOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`organization_fields`](SearchResultOneBuilder::organization_fields)
    /// - [`r#type`](SearchResultOneBuilder::r#type)
    pub fn build(self) -> Result<SearchResultOne, BuildError> {
        Ok(SearchResultOne {
            organization_fields: self.organization_fields.ok_or_else(|| BuildError::missing_field("organization_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
