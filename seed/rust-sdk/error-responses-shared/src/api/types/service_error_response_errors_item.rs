pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ServiceErrorResponseErrorsItem {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl ServiceErrorResponseErrorsItem {
    pub fn builder() -> ServiceErrorResponseErrorsItemBuilder {
        <ServiceErrorResponseErrorsItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ServiceErrorResponseErrorsItemBuilder {
    field: Option<String>,
    message: Option<String>,
}

impl ServiceErrorResponseErrorsItemBuilder {
    pub fn field(mut self, value: impl Into<String>) -> Self {
        self.field = Some(value.into());
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ServiceErrorResponseErrorsItem`].
    pub fn build(self) -> Result<ServiceErrorResponseErrorsItem, BuildError> {
        Ok(ServiceErrorResponseErrorsItem {
            field: self.field,
            message: self.message,
        })
    }
}
