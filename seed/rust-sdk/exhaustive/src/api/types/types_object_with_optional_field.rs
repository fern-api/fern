pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesObjectWithOptionalField {
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
    pub datetime: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base64: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub set: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map: Option<HashMap<String, Option<String>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bigint: Option<i64>,
}

impl TypesObjectWithOptionalField {
    pub fn builder() -> TypesObjectWithOptionalFieldBuilder {
        <TypesObjectWithOptionalFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithOptionalFieldBuilder {
    string: Option<String>,
    integer: Option<i64>,
    long: Option<i64>,
    double: Option<f64>,
    bool: Option<bool>,
    datetime: Option<DateTime<FixedOffset>>,
    date: Option<NaiveDate>,
    uuid: Option<String>,
    base64: Option<String>,
    list: Option<Vec<String>>,
    set: Option<Vec<String>>,
    map: Option<HashMap<String, Option<String>>>,
    bigint: Option<i64>,
}

impl TypesObjectWithOptionalFieldBuilder {
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

    pub fn uuid(mut self, value: impl Into<String>) -> Self {
        self.uuid = Some(value.into());
        self
    }

    pub fn base64(mut self, value: impl Into<String>) -> Self {
        self.base64 = Some(value.into());
        self
    }

    pub fn list(mut self, value: Vec<String>) -> Self {
        self.list = Some(value);
        self
    }

    pub fn set(mut self, value: Vec<String>) -> Self {
        self.set = Some(value);
        self
    }

    pub fn map(mut self, value: HashMap<String, Option<String>>) -> Self {
        self.map = Some(value);
        self
    }

    pub fn bigint(mut self, value: i64) -> Self {
        self.bigint = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithOptionalField`].
    pub fn build(self) -> Result<TypesObjectWithOptionalField, BuildError> {
        Ok(TypesObjectWithOptionalField {
            string: self.string,
            integer: self.integer,
            long: self.long,
            double: self.double,
            bool: self.bool,
            datetime: self.datetime,
            date: self.date,
            uuid: self.uuid,
            base64: self.base64,
            list: self.list,
            set: self.set,
            map: self.map,
            bigint: self.bigint,
        })
    }
}
