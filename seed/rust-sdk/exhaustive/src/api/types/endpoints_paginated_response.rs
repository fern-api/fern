pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsPaginatedResponse {
    #[serde(default)]
    pub items: Vec<TypesObjectWithRequiredField>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl EndpointsPaginatedResponse {
    pub fn builder() -> EndpointsPaginatedResponseBuilder {
        <EndpointsPaginatedResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsPaginatedResponseBuilder {
    items: Option<Vec<TypesObjectWithRequiredField>>,
    next: Option<String>,
}

impl EndpointsPaginatedResponseBuilder {
    pub fn items(mut self, value: Vec<TypesObjectWithRequiredField>) -> Self {
        self.items = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`EndpointsPaginatedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`items`](EndpointsPaginatedResponseBuilder::items)
    pub fn build(self) -> Result<EndpointsPaginatedResponse, BuildError> {
        Ok(EndpointsPaginatedResponse {
            items: self
                .items
                .ok_or_else(|| BuildError::missing_field("items"))?,
            next: self.next,
        })
    }
}
