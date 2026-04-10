pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExceptionZero {
    #[serde(flatten)]
    pub exception_info_fields: ExceptionInfo,
    pub r#type: ExceptionZeroType,
}

impl ExceptionZero {
    pub fn builder() -> ExceptionZeroBuilder {
        <ExceptionZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExceptionZeroBuilder {
    exception_info_fields: Option<ExceptionInfo>,
    r#type: Option<ExceptionZeroType>,
}

impl ExceptionZeroBuilder {
    pub fn exception_info_fields(mut self, value: ExceptionInfo) -> Self {
        self.exception_info_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ExceptionZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExceptionZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`exception_info_fields`](ExceptionZeroBuilder::exception_info_fields)
    /// - [`r#type`](ExceptionZeroBuilder::r#type)
    pub fn build(self) -> Result<ExceptionZero, BuildError> {
        Ok(ExceptionZero {
            exception_info_fields: self.exception_info_fields.ok_or_else(|| BuildError::missing_field("exception_info_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
