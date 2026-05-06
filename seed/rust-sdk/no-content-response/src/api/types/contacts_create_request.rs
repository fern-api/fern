pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ContactsCreateRequest {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
}

impl ContactsCreateRequest {
    pub fn builder() -> ContactsCreateRequestBuilder {
        <ContactsCreateRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ContactsCreateRequestBuilder {
    name: Option<String>,
    email: Option<String>,
}

impl ContactsCreateRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ContactsCreateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](ContactsCreateRequestBuilder::name)
    pub fn build(self) -> Result<ContactsCreateRequest, BuildError> {
        Ok(ContactsCreateRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            email: self.email,
        })
    }
}
