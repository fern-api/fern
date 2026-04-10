pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Error {
    pub category: ErrorCategory,
    pub code: ErrorCode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
}

impl Error {
    pub fn builder() -> ErrorBuilder {
        <ErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorBuilder {
    category: Option<ErrorCategory>,
    code: Option<ErrorCode>,
    detail: Option<String>,
    field: Option<String>,
}

impl ErrorBuilder {
    pub fn category(mut self, value: ErrorCategory) -> Self {
        self.category = Some(value);
        self
    }

    pub fn code(mut self, value: ErrorCode) -> Self {
        self.code = Some(value);
        self
    }

    pub fn detail(mut self, value: impl Into<String>) -> Self {
        self.detail = Some(value.into());
        self
    }

    pub fn field(mut self, value: impl Into<String>) -> Self {
        self.field = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Error`].
    /// This method will fail if any of the following fields are not set:
    /// - [`category`](ErrorBuilder::category)
    /// - [`code`](ErrorBuilder::code)
    pub fn build(self) -> Result<Error, BuildError> {
        Ok(Error {
            category: self.category.ok_or_else(|| BuildError::missing_field("category"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
            detail: self.detail,
            field: self.field,
        })
    }
}
