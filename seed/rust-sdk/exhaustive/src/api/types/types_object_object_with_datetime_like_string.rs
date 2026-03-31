pub use crate::prelude::*;

/// This type tests that string fields containing datetime-like values
/// are NOT reformatted by the wire test generator. The string field
/// should preserve its exact value even if it looks like a datetime.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectWithDatetimeLikeString {
    /// A string field that happens to contain a datetime-like value
    #[serde(rename = "datetimeLikeString")]
    #[serde(default)]
    pub datetime_like_string: String,
    /// An actual datetime field for comparison
    #[serde(rename = "actualDatetime")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub actual_datetime: DateTime<FixedOffset>,
}

impl ObjectWithDatetimeLikeString {
    pub fn builder() -> ObjectWithDatetimeLikeStringBuilder {
        <ObjectWithDatetimeLikeStringBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithDatetimeLikeStringBuilder {
    datetime_like_string: Option<String>,
    actual_datetime: Option<DateTime<FixedOffset>>,
}

impl ObjectWithDatetimeLikeStringBuilder {
    pub fn datetime_like_string(mut self, value: impl Into<String>) -> Self {
        self.datetime_like_string = Some(value.into());
        self
    }

    pub fn actual_datetime(mut self, value: DateTime<FixedOffset>) -> Self {
        self.actual_datetime = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithDatetimeLikeString`].
    /// This method will fail if any of the following fields are not set:
    /// - [`datetime_like_string`](ObjectWithDatetimeLikeStringBuilder::datetime_like_string)
    /// - [`actual_datetime`](ObjectWithDatetimeLikeStringBuilder::actual_datetime)
    pub fn build(self) -> Result<ObjectWithDatetimeLikeString, BuildError> {
        Ok(ObjectWithDatetimeLikeString {
            datetime_like_string: self
                .datetime_like_string
                .ok_or_else(|| BuildError::missing_field("datetime_like_string"))?,
            actual_datetime: self
                .actual_datetime
                .ok_or_else(|| BuildError::missing_field("actual_datetime"))?,
        })
    }
}
