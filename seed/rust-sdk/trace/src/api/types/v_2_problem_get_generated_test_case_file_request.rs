pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseFileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<TestCaseTemplate>,
    #[serde(rename = "testCase")]
    pub test_case: TestCaseV2,
}

impl GetGeneratedTestCaseFileRequest {
    pub fn builder() -> GetGeneratedTestCaseFileRequestBuilder {
        GetGeneratedTestCaseFileRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetGeneratedTestCaseFileRequestBuilder {
    template: Option<TestCaseTemplate>,
    test_case: Option<TestCaseV2>,
}

impl GetGeneratedTestCaseFileRequestBuilder {
    pub fn template(mut self, value: TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    pub fn test_case(mut self, value: TestCaseV2) -> Self {
        self.test_case = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetGeneratedTestCaseFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case`](GetGeneratedTestCaseFileRequestBuilder::test_case)
    pub fn build(self) -> Result<GetGeneratedTestCaseFileRequest, BuildError> {
        Ok(GetGeneratedTestCaseFileRequest {
            template: self.template,
            test_case: self
                .test_case
                .ok_or_else(|| BuildError::missing_field("test_case"))?,
        })
    }
}
