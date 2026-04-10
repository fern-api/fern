pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Practitioner {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: PractitionerResourceType,
    #[serde(default)]
    pub name: String,
}

impl Practitioner {
    pub fn builder() -> PractitionerBuilder {
        <PractitionerBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PractitionerBuilder {
    base_resource_fields: Option<BaseResource>,
    resource_type: Option<PractitionerResourceType>,
    name: Option<String>,
}

impl PractitionerBuilder {
    pub fn base_resource_fields(mut self, value: BaseResource) -> Self {
        self.base_resource_fields = Some(value);
        self
    }

    pub fn resource_type(mut self, value: PractitionerResourceType) -> Self {
        self.resource_type = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Practitioner`].
    /// This method will fail if any of the following fields are not set:
    /// - [`base_resource_fields`](PractitionerBuilder::base_resource_fields)
    /// - [`resource_type`](PractitionerBuilder::resource_type)
    /// - [`name`](PractitionerBuilder::name)
    pub fn build(self) -> Result<Practitioner, BuildError> {
        Ok(Practitioner {
            base_resource_fields: self.base_resource_fields.ok_or_else(|| BuildError::missing_field("base_resource_fields"))?,
            resource_type: self.resource_type.ok_or_else(|| BuildError::missing_field("resource_type"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
