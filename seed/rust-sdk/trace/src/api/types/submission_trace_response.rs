pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TraceResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "lineNumber")]
    #[serde(default)]
    pub line_number: i64,
    #[serde(rename = "returnValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub return_value: Option<DebugVariableValue>,
    #[serde(rename = "expressionLocation")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression_location: Option<ExpressionLocation>,
    #[serde(default)]
    pub stack: StackInformation,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stdout: Option<String>,
}

impl TraceResponse {
    pub fn builder() -> TraceResponseBuilder {
        <TraceResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TraceResponseBuilder {
    submission_id: Option<SubmissionId>,
    line_number: Option<i64>,
    return_value: Option<DebugVariableValue>,
    expression_location: Option<ExpressionLocation>,
    stack: Option<StackInformation>,
    stdout: Option<String>,
}

impl TraceResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn line_number(mut self, value: i64) -> Self {
        self.line_number = Some(value);
        self
    }

    pub fn return_value(mut self, value: DebugVariableValue) -> Self {
        self.return_value = Some(value);
        self
    }

    pub fn expression_location(mut self, value: ExpressionLocation) -> Self {
        self.expression_location = Some(value);
        self
    }

    pub fn stack(mut self, value: StackInformation) -> Self {
        self.stack = Some(value);
        self
    }

    pub fn stdout(mut self, value: impl Into<String>) -> Self {
        self.stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TraceResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](TraceResponseBuilder::submission_id)
    /// - [`line_number`](TraceResponseBuilder::line_number)
    /// - [`stack`](TraceResponseBuilder::stack)
    pub fn build(self) -> Result<TraceResponse, BuildError> {
        Ok(TraceResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            line_number: self
                .line_number
                .ok_or_else(|| BuildError::missing_field("line_number"))?,
            return_value: self.return_value,
            expression_location: self.expression_location,
            stack: self
                .stack
                .ok_or_else(|| BuildError::missing_field("stack"))?,
            stdout: self.stdout,
        })
    }
}
