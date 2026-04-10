pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExceptionV2Type {
    pub r#type: ExceptionV2TypeType,
}

impl ExceptionV2Type {
    pub fn builder() -> ExceptionV2TypeBuilder {
        <ExceptionV2TypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExceptionV2TypeBuilder {
    r#type: Option<ExceptionV2TypeType>,
}

impl ExceptionV2TypeBuilder {
    pub fn r#type(mut self, value: ExceptionV2TypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExceptionV2Type`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](ExceptionV2TypeBuilder::r#type)
    pub fn build(self) -> Result<ExceptionV2Type, BuildError> {
        Ok(ExceptionV2Type {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
