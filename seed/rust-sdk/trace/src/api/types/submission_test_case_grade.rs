pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseGrade {
        #[serde(rename = "hidden")]
        Hidden {
            #[serde(flatten)]
            data: TestCaseHiddenGrade,
        },

        #[serde(rename = "nonHidden")]
        NonHidden {
            #[serde(flatten)]
            data: TestCaseNonHiddenGrade,
        },
}
