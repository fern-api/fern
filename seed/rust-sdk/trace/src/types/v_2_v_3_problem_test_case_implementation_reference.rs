use crate::v_2_problem_test_case_implementation::TestCaseImplementation;
use crate::v_2_problem_test_case_template_id::TestCaseTemplateId;
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
