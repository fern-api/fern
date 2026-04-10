pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ResourceOne {
    #[serde(flatten)]
    pub organization_fields: Organization,
    pub resource_type: ResourceOneResourceType,
}

impl ResourceOne {
    pub fn builder() -> ResourceOneBuilder {
        <ResourceOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResourceOneBuilder {
    organization_fields: Option<Organization>,
    resource_type: Option<ResourceOneResourceType>,
}

impl ResourceOneBuilder {
    pub fn organization_fields(mut self, value: Organization) -> Self {
        self.organization_fields = Some(value);
        self
    }

    pub fn resource_type(mut self, value: ResourceOneResourceType) -> Self {
        self.resource_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ResourceOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`organization_fields`](ResourceOneBuilder::organization_fields)
    /// - [`resource_type`](ResourceOneBuilder::resource_type)
    pub fn build(self) -> Result<ResourceOne, BuildError> {
        Ok(ResourceOne {
            organization_fields: self.organization_fields.ok_or_else(|| BuildError::missing_field("organization_fields"))?,
            resource_type: self.resource_type.ok_or_else(|| BuildError::missing_field("resource_type"))?,
        })
    }
}
