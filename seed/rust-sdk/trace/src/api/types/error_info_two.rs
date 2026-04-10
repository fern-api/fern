pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ErrorInfoTwo {
    #[serde(flatten)]
    pub internal_error_fields: InternalError,
    pub r#type: ErrorInfoTwoType,
}

impl ErrorInfoTwo {
    pub fn builder() -> ErrorInfoTwoBuilder {
        <ErrorInfoTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorInfoTwoBuilder {
    internal_error_fields: Option<InternalError>,
    r#type: Option<ErrorInfoTwoType>,
}

impl ErrorInfoTwoBuilder {
    pub fn internal_error_fields(mut self, value: InternalError) -> Self {
        self.internal_error_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ErrorInfoTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorInfoTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`internal_error_fields`](ErrorInfoTwoBuilder::internal_error_fields)
    /// - [`r#type`](ErrorInfoTwoBuilder::r#type)
    pub fn build(self) -> Result<ErrorInfoTwo, BuildError> {
        Ok(ErrorInfoTwo {
            internal_error_fields: self
                .internal_error_fields
                .ok_or_else(|| BuildError::missing_field("internal_error_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
