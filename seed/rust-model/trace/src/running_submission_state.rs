use serde::{Deserialize, Serialize};

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