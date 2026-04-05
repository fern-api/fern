pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RunningSubmissionState {
    QueueingSubmission,
    KillingHistoricalSubmissions,
    WritingSubmissionToFile,
    CompilingSubmission,
    RunningSubmission,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for RunningSubmissionState {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::QueueingSubmission => serializer.serialize_str("QUEUEING_SUBMISSION"),
            Self::KillingHistoricalSubmissions => serializer.serialize_str("KILLING_HISTORICAL_SUBMISSIONS"),
            Self::WritingSubmissionToFile => serializer.serialize_str("WRITING_SUBMISSION_TO_FILE"),
            Self::CompilingSubmission => serializer.serialize_str("COMPILING_SUBMISSION"),
            Self::RunningSubmission => serializer.serialize_str("RUNNING_SUBMISSION"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for RunningSubmissionState {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "QUEUEING_SUBMISSION" => Ok(Self::QueueingSubmission),
            "KILLING_HISTORICAL_SUBMISSIONS" => Ok(Self::KillingHistoricalSubmissions),
            "WRITING_SUBMISSION_TO_FILE" => Ok(Self::WritingSubmissionToFile),
            "COMPILING_SUBMISSION" => Ok(Self::CompilingSubmission),
            "RUNNING_SUBMISSION" => Ok(Self::RunningSubmission),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for RunningSubmissionState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::QueueingSubmission => write!(f, "QUEUEING_SUBMISSION"),
            Self::KillingHistoricalSubmissions => write!(f, "KILLING_HISTORICAL_SUBMISSIONS"),
            Self::WritingSubmissionToFile => write!(f, "WRITING_SUBMISSION_TO_FILE"),
            Self::CompilingSubmission => write!(f, "COMPILING_SUBMISSION"),
            Self::RunningSubmission => write!(f, "RUNNING_SUBMISSION"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
