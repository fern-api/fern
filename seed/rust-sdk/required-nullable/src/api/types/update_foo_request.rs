pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateFooRequest {
    /// Can be explicitly set to null to clear the value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_text: Option<String>,
    /// Can be explicitly set to null to clear the value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_number: Option<f64>,
    /// Regular non-nullable field
    #[serde(skip_serializing_if = "Option::is_none")]
    pub non_nullable_text: Option<String>,
}

impl UpdateFooRequest {
    pub fn builder() -> UpdateFooRequestBuilder {
        UpdateFooRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateFooRequestBuilder {
    nullable_text: Option<String>,
    nullable_number: Option<f64>,
    non_nullable_text: Option<String>,
}

impl UpdateFooRequestBuilder {
    pub fn nullable_text(mut self, value: impl Into<String>) -> Self {
        self.nullable_text = Some(value.into());
        self
    }

    pub fn nullable_number(mut self, value: f64) -> Self {
        self.nullable_number = Some(value);
        self
    }

    pub fn non_nullable_text(mut self, value: impl Into<String>) -> Self {
        self.non_nullable_text = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UpdateFooRequest`].
    pub fn build(self) -> Result<UpdateFooRequest, BuildError> {
        Ok(UpdateFooRequest {
            nullable_text: self.nullable_text,
            nullable_number: self.nullable_number,
            non_nullable_text: self.non_nullable_text,
        })
    }
}
