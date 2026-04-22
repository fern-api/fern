pub use crate::prelude::*;

/// Response for deserialization test
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DeserializationTestResponse {
    #[serde(default)]
    pub echo: DeserializationTestRequest,
    #[serde(rename = "processedAt")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub processed_at: DateTime<FixedOffset>,
    #[serde(rename = "nullCount")]
    #[serde(default)]
    pub null_count: i64,
    #[serde(rename = "presentFieldsCount")]
    #[serde(default)]
    pub present_fields_count: i64,
}

impl DeserializationTestResponse {
    pub fn builder() -> DeserializationTestResponseBuilder {
        <DeserializationTestResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeserializationTestResponseBuilder {
    echo: Option<DeserializationTestRequest>,
    processed_at: Option<DateTime<FixedOffset>>,
    null_count: Option<i64>,
    present_fields_count: Option<i64>,
}

impl DeserializationTestResponseBuilder {
    pub fn echo(mut self, value: DeserializationTestRequest) -> Self {
        self.echo = Some(value);
        self
    }

    pub fn processed_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.processed_at = Some(value);
        self
    }

    pub fn null_count(mut self, value: i64) -> Self {
        self.null_count = Some(value);
        self
    }

    pub fn present_fields_count(mut self, value: i64) -> Self {
        self.present_fields_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeserializationTestResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`echo`](DeserializationTestResponseBuilder::echo)
    /// - [`processed_at`](DeserializationTestResponseBuilder::processed_at)
    /// - [`null_count`](DeserializationTestResponseBuilder::null_count)
    /// - [`present_fields_count`](DeserializationTestResponseBuilder::present_fields_count)
    pub fn build(self) -> Result<DeserializationTestResponse, BuildError> {
        Ok(DeserializationTestResponse {
            echo: self.echo.ok_or_else(|| BuildError::missing_field("echo"))?,
            processed_at: self
                .processed_at
                .ok_or_else(|| BuildError::missing_field("processed_at"))?,
            null_count: self
                .null_count
                .ok_or_else(|| BuildError::missing_field("null_count"))?,
            present_fields_count: self
                .present_fields_count
                .ok_or_else(|| BuildError::missing_field("present_fields_count"))?,
        })
    }
}
