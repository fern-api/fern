pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseImplementationReferenceOne {
    #[serde(flatten)]
    pub v2test_case_implementation_fields: V2TestCaseImplementation,
    pub r#type: V2TestCaseImplementationReferenceOneType,
}

impl V2TestCaseImplementationReferenceOne {
    pub fn builder() -> V2TestCaseImplementationReferenceOneBuilder {
        <V2TestCaseImplementationReferenceOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseImplementationReferenceOneBuilder {
    v2test_case_implementation_fields: Option<V2TestCaseImplementation>,
    r#type: Option<V2TestCaseImplementationReferenceOneType>,
}

impl V2TestCaseImplementationReferenceOneBuilder {
    pub fn v2test_case_implementation_fields(mut self, value: V2TestCaseImplementation) -> Self {
        self.v2test_case_implementation_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2TestCaseImplementationReferenceOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseImplementationReferenceOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2test_case_implementation_fields`](V2TestCaseImplementationReferenceOneBuilder::v2test_case_implementation_fields)
    /// - [`r#type`](V2TestCaseImplementationReferenceOneBuilder::r#type)
    pub fn build(self) -> Result<V2TestCaseImplementationReferenceOne, BuildError> {
        Ok(V2TestCaseImplementationReferenceOne {
            v2test_case_implementation_fields: self
                .v2test_case_implementation_fields
                .ok_or_else(|| BuildError::missing_field("v2test_case_implementation_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
