pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InvalidRequestCauseOne {
    #[serde(flatten)]
    pub custom_test_cases_unsupported_fields: CustomTestCasesUnsupported,
    pub r#type: InvalidRequestCauseOneType,
}

impl InvalidRequestCauseOne {
    pub fn builder() -> InvalidRequestCauseOneBuilder {
        <InvalidRequestCauseOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InvalidRequestCauseOneBuilder {
    custom_test_cases_unsupported_fields: Option<CustomTestCasesUnsupported>,
    r#type: Option<InvalidRequestCauseOneType>,
}

impl InvalidRequestCauseOneBuilder {
    pub fn custom_test_cases_unsupported_fields(
        mut self,
        value: CustomTestCasesUnsupported,
    ) -> Self {
        self.custom_test_cases_unsupported_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: InvalidRequestCauseOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InvalidRequestCauseOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`custom_test_cases_unsupported_fields`](InvalidRequestCauseOneBuilder::custom_test_cases_unsupported_fields)
    /// - [`r#type`](InvalidRequestCauseOneBuilder::r#type)
    pub fn build(self) -> Result<InvalidRequestCauseOne, BuildError> {
        Ok(InvalidRequestCauseOne {
            custom_test_cases_unsupported_fields: self
                .custom_test_cases_unsupported_fields
                .ok_or_else(|| BuildError::missing_field("custom_test_cases_unsupported_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
