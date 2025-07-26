use crate::test_case_template_id::TestCaseTemplateId;
use crate::test_case_implementation::TestCaseImplementation;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseImplementationReference {
        TemplateId {
            value: TestCaseTemplateId,
        },

        Implementation {
            #[serde(flatten)]
            data: TestCaseImplementation,
        },
}
