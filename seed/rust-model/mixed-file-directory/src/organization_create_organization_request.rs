pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrganizationRequest {
    #[serde(default)]
    pub name: String,
}

impl CreateOrganizationRequest {
    pub fn builder() -> CreateOrganizationRequestBuilder {
        CreateOrganizationRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateOrganizationRequestBuilder {
    name: Option<String>,
}

impl CreateOrganizationRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateOrganizationRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CreateOrganizationRequestBuilder::name)
    pub fn build(self) -> Result<CreateOrganizationRequest, BuildError> {
        Ok(CreateOrganizationRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
