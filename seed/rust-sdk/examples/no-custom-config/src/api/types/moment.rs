pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Moment {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub datetime: DateTime<FixedOffset>,
}

impl Moment {
    pub fn builder() -> MomentBuilder {
        <MomentBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MomentBuilder {
    id: Option<String>,
    date: Option<NaiveDate>,
    datetime: Option<DateTime<FixedOffset>>,
}

impl MomentBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn date(mut self, value: NaiveDate) -> Self {
        self.date = Some(value);
        self
    }

    pub fn datetime(mut self, value: DateTime<FixedOffset>) -> Self {
        self.datetime = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Moment`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MomentBuilder::id)
    /// - [`date`](MomentBuilder::date)
    /// - [`datetime`](MomentBuilder::datetime)
    pub fn build(self) -> Result<Moment, BuildError> {
        Ok(Moment {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            date: self.date.ok_or_else(|| BuildError::missing_field("date"))?,
            datetime: self.datetime.ok_or_else(|| BuildError::missing_field("datetime"))?,
        })
    }
}
