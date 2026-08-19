pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseFileRequest2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<TestCaseTemplate2>,
    #[serde(rename = "testCase")]
    pub test_case: TestCaseV22,
}

impl GetGeneratedTestCaseFileRequest2 {
    pub fn builder() -> GetGeneratedTestCaseFileRequest2Builder {
        <GetGeneratedTestCaseFileRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetGeneratedTestCaseFileRequest2Builder {
    template: Option<TestCaseTemplate2>,
    test_case: Option<TestCaseV22>,
}

impl GetGeneratedTestCaseFileRequest2Builder {
    pub fn template(mut self, value: TestCaseTemplate2) -> Self {
        self.template = Some(value);
        self
    }

    pub fn test_case(mut self, value: TestCaseV22) -> Self {
        self.test_case = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetGeneratedTestCaseFileRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case`](GetGeneratedTestCaseFileRequest2Builder::test_case)
    pub fn build(self) -> Result<GetGeneratedTestCaseFileRequest2, BuildError> {
        Ok(GetGeneratedTestCaseFileRequest2 {
            template: self.template,
            test_case: self
                .test_case
                .ok_or_else(|| BuildError::missing_field("test_case"))?,
        })
    }
}
