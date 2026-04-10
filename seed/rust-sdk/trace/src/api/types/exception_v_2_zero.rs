pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExceptionV2Zero {
    #[serde(flatten)]
    pub exception_info_fields: ExceptionInfo,
    pub r#type: ExceptionV2ZeroType,
}

impl ExceptionV2Zero {
    pub fn builder() -> ExceptionV2ZeroBuilder {
        <ExceptionV2ZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExceptionV2ZeroBuilder {
    exception_info_fields: Option<ExceptionInfo>,
    r#type: Option<ExceptionV2ZeroType>,
}

impl ExceptionV2ZeroBuilder {
    pub fn exception_info_fields(mut self, value: ExceptionInfo) -> Self {
        self.exception_info_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ExceptionV2ZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExceptionV2Zero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`exception_info_fields`](ExceptionV2ZeroBuilder::exception_info_fields)
    /// - [`r#type`](ExceptionV2ZeroBuilder::r#type)
    pub fn build(self) -> Result<ExceptionV2Zero, BuildError> {
        Ok(ExceptionV2Zero {
            exception_info_fields: self
                .exception_info_fields
                .ok_or_else(|| BuildError::missing_field("exception_info_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
