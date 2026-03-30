pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateContactRequest {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
}

impl CreateContactRequest {
    pub fn builder() -> CreateContactRequestBuilder {
        <CreateContactRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateContactRequestBuilder {
    name: Option<String>,
    email: Option<String>,
}

impl CreateContactRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateContactRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CreateContactRequestBuilder::name)
    pub fn build(self) -> Result<CreateContactRequest, BuildError> {
        Ok(CreateContactRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            email: self.email,
        })
    }
}

