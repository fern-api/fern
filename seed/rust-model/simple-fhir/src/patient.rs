pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Patient {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub scripts: Vec<Script>,
}

impl Patient {
    pub fn builder() -> PatientBuilder {
        PatientBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PatientBuilder {
    base_resource_fields: Option<BaseResource>,
    resource_type: Option<String>,
    name: Option<String>,
    scripts: Option<Vec<Script>>,
}

impl PatientBuilder {
    pub fn base_resource_fields(mut self, value: BaseResource) -> Self {
        self.base_resource_fields = Some(value);
        self
    }

    pub fn resource_type(mut self, value: impl Into<String>) -> Self {
        self.resource_type = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn scripts(mut self, value: Vec<Script>) -> Self {
        self.scripts = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Patient`].
    /// This method will fail if any of the following fields are not set:
    /// - [`base_resource_fields`](PatientBuilder::base_resource_fields)
    /// - [`resource_type`](PatientBuilder::resource_type)
    /// - [`name`](PatientBuilder::name)
    /// - [`scripts`](PatientBuilder::scripts)
    pub fn build(self) -> Result<Patient, BuildError> {
        Ok(Patient {
            base_resource_fields: self.base_resource_fields.ok_or_else(|| BuildError::missing_field("base_resource_fields"))?,
            resource_type: self.resource_type.ok_or_else(|| BuildError::missing_field("resource_type"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            scripts: self.scripts.ok_or_else(|| BuildError::missing_field("scripts"))?,
        })
    }
}
