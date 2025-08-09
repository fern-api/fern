use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RunningSubmissionState {
    #[serde(rename = "QUEUEING_SUBMISSION")]
    QueueingSubmission,
    #[serde(rename = "KILLING_HISTORICAL_SUBMISSIONS")]
    KillingHistoricalSubmissions,
    #[serde(rename = "WRITING_SUBMISSION_TO_FILE")]
    WritingSubmissionToFile,
    #[serde(rename = "COMPILING_SUBMISSION")]
    CompilingSubmission,
    #[serde(rename = "RUNNING_SUBMISSION")]
    RunningSubmission,
}
impl fmt::Display for RunningSubmissionState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::QueueingSubmission => "QUEUEING_SUBMISSION",
            Self::KillingHistoricalSubmissions => "KILLING_HISTORICAL_SUBMISSIONS",
            Self::WritingSubmissionToFile => "WRITING_SUBMISSION_TO_FILE",
            Self::CompilingSubmission => "COMPILING_SUBMISSION",
            Self::RunningSubmission => "RUNNING_SUBMISSION",
        };
        write!(f, "{}", s)
    }
}
