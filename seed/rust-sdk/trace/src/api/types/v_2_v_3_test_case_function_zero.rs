pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseFunctionZero {
    #[serde(flatten)]
    pub v2v3test_case_with_actual_result_implementation_fields:
        V2V3TestCaseWithActualResultImplementation,
    pub r#type: V2V3TestCaseFunctionZeroType,
}

impl V2V3TestCaseFunctionZero {
    pub fn builder() -> V2V3TestCaseFunctionZeroBuilder {
        <V2V3TestCaseFunctionZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseFunctionZeroBuilder {
    v2v3test_case_with_actual_result_implementation_fields:
        Option<V2V3TestCaseWithActualResultImplementation>,
    r#type: Option<V2V3TestCaseFunctionZeroType>,
}

impl V2V3TestCaseFunctionZeroBuilder {
    pub fn v2v3test_case_with_actual_result_implementation_fields(
        mut self,
        value: V2V3TestCaseWithActualResultImplementation,
    ) -> Self {
        self.v2v3test_case_with_actual_result_implementation_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3TestCaseFunctionZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseFunctionZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3test_case_with_actual_result_implementation_fields`](V2V3TestCaseFunctionZeroBuilder::v2v3test_case_with_actual_result_implementation_fields)
    /// - [`r#type`](V2V3TestCaseFunctionZeroBuilder::r#type)
    pub fn build(self) -> Result<V2V3TestCaseFunctionZero, BuildError> {
        Ok(V2V3TestCaseFunctionZero {
            v2v3test_case_with_actual_result_implementation_fields: self
                .v2v3test_case_with_actual_result_implementation_fields
                .ok_or_else(|| {
                    BuildError::missing_field(
                        "v2v3test_case_with_actual_result_implementation_fields",
                    )
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
