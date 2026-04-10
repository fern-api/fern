pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseImplementationReferenceOne {
    #[serde(flatten)]
    pub v2v3test_case_implementation_fields: V2V3TestCaseImplementation,
    pub r#type: V2V3TestCaseImplementationReferenceOneType,
}

impl V2V3TestCaseImplementationReferenceOne {
    pub fn builder() -> V2V3TestCaseImplementationReferenceOneBuilder {
        <V2V3TestCaseImplementationReferenceOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseImplementationReferenceOneBuilder {
    v2v3test_case_implementation_fields: Option<V2V3TestCaseImplementation>,
    r#type: Option<V2V3TestCaseImplementationReferenceOneType>,
}

impl V2V3TestCaseImplementationReferenceOneBuilder {
    pub fn v2v3test_case_implementation_fields(mut self, value: V2V3TestCaseImplementation) -> Self {
        self.v2v3test_case_implementation_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3TestCaseImplementationReferenceOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseImplementationReferenceOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3test_case_implementation_fields`](V2V3TestCaseImplementationReferenceOneBuilder::v2v3test_case_implementation_fields)
    /// - [`r#type`](V2V3TestCaseImplementationReferenceOneBuilder::r#type)
    pub fn build(self) -> Result<V2V3TestCaseImplementationReferenceOne, BuildError> {
        Ok(V2V3TestCaseImplementationReferenceOne {
            v2v3test_case_implementation_fields: self.v2v3test_case_implementation_fields.ok_or_else(|| BuildError::missing_field("v2v3test_case_implementation_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
