pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ErrorInfoZero {
    #[serde(flatten)]
    pub compile_error_fields: CompileError,
    pub r#type: ErrorInfoZeroType,
}

impl ErrorInfoZero {
    pub fn builder() -> ErrorInfoZeroBuilder {
        <ErrorInfoZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorInfoZeroBuilder {
    compile_error_fields: Option<CompileError>,
    r#type: Option<ErrorInfoZeroType>,
}

impl ErrorInfoZeroBuilder {
    pub fn compile_error_fields(mut self, value: CompileError) -> Self {
        self.compile_error_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ErrorInfoZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorInfoZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`compile_error_fields`](ErrorInfoZeroBuilder::compile_error_fields)
    /// - [`r#type`](ErrorInfoZeroBuilder::r#type)
    pub fn build(self) -> Result<ErrorInfoZero, BuildError> {
        Ok(ErrorInfoZero {
            compile_error_fields: self.compile_error_fields.ok_or_else(|| BuildError::missing_field("compile_error_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
