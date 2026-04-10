pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestSubmissionUpdateInfoZero {
    pub r#type: TestSubmissionUpdateInfoZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<RunningSubmissionState>,
}

impl TestSubmissionUpdateInfoZero {
    pub fn builder() -> TestSubmissionUpdateInfoZeroBuilder {
        <TestSubmissionUpdateInfoZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoZeroBuilder {
    r#type: Option<TestSubmissionUpdateInfoZeroType>,
    value: Option<RunningSubmissionState>,
}

impl TestSubmissionUpdateInfoZeroBuilder {
    pub fn r#type(mut self, value: TestSubmissionUpdateInfoZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: RunningSubmissionState) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](TestSubmissionUpdateInfoZeroBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoZero, BuildError> {
        Ok(TestSubmissionUpdateInfoZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
