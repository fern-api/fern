pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ErrorInfoOne {
    #[serde(flatten)]
    pub runtime_error_fields: RuntimeError,
    pub r#type: ErrorInfoOneType,
}

impl ErrorInfoOne {
    pub fn builder() -> ErrorInfoOneBuilder {
        <ErrorInfoOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorInfoOneBuilder {
    runtime_error_fields: Option<RuntimeError>,
    r#type: Option<ErrorInfoOneType>,
}

impl ErrorInfoOneBuilder {
    pub fn runtime_error_fields(mut self, value: RuntimeError) -> Self {
        self.runtime_error_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ErrorInfoOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorInfoOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`runtime_error_fields`](ErrorInfoOneBuilder::runtime_error_fields)
    /// - [`r#type`](ErrorInfoOneBuilder::r#type)
    pub fn build(self) -> Result<ErrorInfoOne, BuildError> {
        Ok(ErrorInfoOne {
            runtime_error_fields: self
                .runtime_error_fields
                .ok_or_else(|| BuildError::missing_field("runtime_error_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
