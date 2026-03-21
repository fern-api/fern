pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithOptionalField {
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub long: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub double: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bool: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub datetime: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<Uuid>,
    #[serde(rename = "base64")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub base_64: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub set: Option<HashSet<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map: Option<HashMap<i64, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::bigint_string::option")]
    pub bigint: Option<num_bigint::BigInt>,
}

impl ObjectWithOptionalField {
    pub fn builder() -> ObjectWithOptionalFieldBuilder {
        ObjectWithOptionalFieldBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithOptionalFieldBuilder {
    string: Option<String>,
    integer: Option<i64>,
    long: Option<i64>,
    double: Option<f64>,
    bool: Option<bool>,
    datetime: Option<DateTime<FixedOffset>>,
    date: Option<NaiveDate>,
    uuid: Option<Uuid>,
    base_64: Option<Vec<u8>>,
    list: Option<Vec<String>>,
    set: Option<HashSet<String>>,
    map: Option<HashMap<i64, String>>,
    bigint: Option<num_bigint::BigInt>,
}

impl ObjectWithOptionalFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn integer(mut self, value: i64) -> Self {
        self.integer = Some(value);
        self
    }

    pub fn long(mut self, value: i64) -> Self {
        self.long = Some(value);
        self
    }

    pub fn double(mut self, value: f64) -> Self {
        self.double = Some(value);
        self
    }

    pub fn bool(mut self, value: bool) -> Self {
        self.bool = Some(value);
        self
    }

    pub fn datetime(mut self, value: DateTime<FixedOffset>) -> Self {
        self.datetime = Some(value);
        self
    }

    pub fn date(mut self, value: NaiveDate) -> Self {
        self.date = Some(value);
        self
    }

    pub fn uuid(mut self, value: Uuid) -> Self {
        self.uuid = Some(value);
        self
    }

    pub fn base_64(mut self, value: Vec<u8>) -> Self {
        self.base_64 = Some(value);
        self
    }

    pub fn list(mut self, value: Vec<String>) -> Self {
        self.list = Some(value);
        self
    }

    pub fn set(mut self, value: HashSet<String>) -> Self {
        self.set = Some(value);
        self
    }

    pub fn map(mut self, value: HashMap<i64, String>) -> Self {
        self.map = Some(value);
        self
    }

    pub fn bigint(mut self, value: num_bigint::BigInt) -> Self {
        self.bigint = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithOptionalField`].
    pub fn build(self) -> Result<ObjectWithOptionalField, BuildError> {
        Ok(ObjectWithOptionalField {
            string: self.string,
            integer: self.integer,
            long: self.long,
            double: self.double,
            bool: self.bool,
            datetime: self.datetime,
            date: self.date,
            uuid: self.uuid,
            base_64: self.base_64,
            list: self.list,
            set: self.set,
            map: self.map,
            bigint: self.bigint,
        })
    }
}
