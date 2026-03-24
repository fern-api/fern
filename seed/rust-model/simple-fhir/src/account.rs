pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Account {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub patient: Option<Patient>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub practitioner: Option<Practitioner>,
}

impl Account {
    pub fn builder() -> AccountBuilder {
        AccountBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AccountBuilder {
    base_resource_fields: Option<BaseResource>,
    resource_type: Option<String>,
    name: Option<String>,
    patient: Option<Patient>,
    practitioner: Option<Practitioner>,
}

impl AccountBuilder {
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

    pub fn patient(mut self, value: Patient) -> Self {
        self.patient = Some(value);
        self
    }

    pub fn practitioner(mut self, value: Practitioner) -> Self {
        self.practitioner = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Account`].
    /// This method will fail if any of the following fields are not set:
    /// - [`base_resource_fields`](AccountBuilder::base_resource_fields)
    /// - [`resource_type`](AccountBuilder::resource_type)
    /// - [`name`](AccountBuilder::name)
    pub fn build(self) -> Result<Account, BuildError> {
        Ok(Account {
            base_resource_fields: self.base_resource_fields.ok_or_else(|| BuildError::missing_field("base_resource_fields"))?,
            resource_type: self.resource_type.ok_or_else(|| BuildError::missing_field("resource_type"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            patient: self.patient,
            practitioner: self.practitioner,
        })
    }
}
