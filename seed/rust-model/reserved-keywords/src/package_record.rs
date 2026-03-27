pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Record {
    #[serde(default)]
    pub foo: HashMap<String, String>,
    #[serde(rename = "3d")]
    #[serde(default)]
    pub _3_d: i64,
}

impl Record {
    pub fn builder() -> RecordBuilder {
        <RecordBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RecordBuilder {
    foo: Option<HashMap<String, String>>,
    _3_d: Option<i64>,
}

impl RecordBuilder {
    pub fn foo(mut self, value: HashMap<String, String>) -> Self {
        self.foo = Some(value);
        self
    }

    pub fn _3_d(mut self, value: i64) -> Self {
        self._3_d = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Record`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](RecordBuilder::foo)
    /// - [`_3_d`](RecordBuilder::_3_d)
    pub fn build(self) -> Result<Record, BuildError> {
        Ok(Record {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
            _3_d: self._3_d.ok_or_else(|| BuildError::missing_field("_3_d"))?,
        })
    }
}
