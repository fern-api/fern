pub use crate::prelude::*;

/// Request for createWithBodyAndQuery (body + query parameters)
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateWithBodyAndQueryRequest {
    #[serde(rename = "_fields")]
    #[serde(skip_serializing)]
    pub fields: Option<String>,
    #[serde(default)]
    pub body: ObjectWithRequiredField,
}

impl CreateWithBodyAndQueryRequest {
    pub fn builder() -> CreateWithBodyAndQueryRequestBuilder {
        <CreateWithBodyAndQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateWithBodyAndQueryRequestBuilder {
    fields: Option<String>,
    body: Option<ObjectWithRequiredField>,
}

impl CreateWithBodyAndQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn body(mut self, value: ObjectWithRequiredField) -> Self {
        self.body = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateWithBodyAndQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`body`](CreateWithBodyAndQueryRequestBuilder::body)
    pub fn build(self) -> Result<CreateWithBodyAndQueryRequest, BuildError> {
        Ok(CreateWithBodyAndQueryRequest {
            fields: self.fields,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
        })
    }
}
