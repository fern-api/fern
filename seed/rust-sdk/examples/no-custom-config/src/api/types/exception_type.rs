pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExceptionType {
    pub r#type: ExceptionTypeType,
}

impl ExceptionType {
    pub fn builder() -> ExceptionTypeBuilder {
        <ExceptionTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExceptionTypeBuilder {
    r#type: Option<ExceptionTypeType>,
}

impl ExceptionTypeBuilder {
    pub fn r#type(mut self, value: ExceptionTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExceptionType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](ExceptionTypeBuilder::r#type)
    pub fn build(self) -> Result<ExceptionType, BuildError> {
        Ok(ExceptionType {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
