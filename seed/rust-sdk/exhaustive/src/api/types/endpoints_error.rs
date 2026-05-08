pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct EndpointsError {
    pub category: EndpointsErrorCategory,
    pub code: EndpointsErrorCode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
}

impl EndpointsError {
    pub fn builder() -> EndpointsErrorBuilder {
        <EndpointsErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsErrorBuilder {
    category: Option<EndpointsErrorCategory>,
    code: Option<EndpointsErrorCode>,
    detail: Option<String>,
    field: Option<String>,
}

impl EndpointsErrorBuilder {
    pub fn category(mut self, value: EndpointsErrorCategory) -> Self {
        self.category = Some(value);
        self
    }

    pub fn code(mut self, value: EndpointsErrorCode) -> Self {
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

    /// Consumes the builder and constructs a [`EndpointsError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`category`](EndpointsErrorBuilder::category)
    /// - [`code`](EndpointsErrorBuilder::code)
    pub fn build(self) -> Result<EndpointsError, BuildError> {
        Ok(EndpointsError {
            category: self
                .category
                .ok_or_else(|| BuildError::missing_field("category"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
            detail: self.detail,
            field: self.field,
        })
    }
}
