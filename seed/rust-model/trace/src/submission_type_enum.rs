use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SubmissionTypeEnum {
    #[serde(rename = "TEST")]
    Test,
}