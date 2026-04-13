pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResourceZero {
    #[serde(flatten)]
    pub user_fields: User,
    pub resource_type: ResourceZeroResourceType,
}

impl ResourceZero {
    pub fn builder() -> ResourceZeroBuilder {
        <ResourceZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResourceZeroBuilder {
    user_fields: Option<User>,
    resource_type: Option<ResourceZeroResourceType>,
}

impl ResourceZeroBuilder {
    pub fn user_fields(mut self, value: User) -> Self {
        self.user_fields = Some(value);
        self
    }

    pub fn resource_type(mut self, value: ResourceZeroResourceType) -> Self {
        self.resource_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ResourceZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_fields`](ResourceZeroBuilder::user_fields)
    /// - [`resource_type`](ResourceZeroBuilder::resource_type)
    pub fn build(self) -> Result<ResourceZero, BuildError> {
        Ok(ResourceZero {
            user_fields: self
                .user_fields
                .ok_or_else(|| BuildError::missing_field("user_fields"))?,
            resource_type: self
                .resource_type
                .ok_or_else(|| BuildError::missing_field("resource_type"))?,
        })
    }
}
