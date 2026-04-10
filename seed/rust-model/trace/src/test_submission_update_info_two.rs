pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestSubmissionUpdateInfoTwo {
    pub r#type: TestSubmissionUpdateInfoTwoType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ErrorInfo>,
}

impl TestSubmissionUpdateInfoTwo {
    pub fn builder() -> TestSubmissionUpdateInfoTwoBuilder {
        <TestSubmissionUpdateInfoTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoTwoBuilder {
    r#type: Option<TestSubmissionUpdateInfoTwoType>,
    value: Option<ErrorInfo>,
}

impl TestSubmissionUpdateInfoTwoBuilder {
    pub fn r#type(mut self, value: TestSubmissionUpdateInfoTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: ErrorInfo) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](TestSubmissionUpdateInfoTwoBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoTwo, BuildError> {
        Ok(TestSubmissionUpdateInfoTwo {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
