pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Record {
    #[serde(default)]
    pub foo: HashMap<String, String>,
    #[serde(default)]
    pub _3d: i64,
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
    _3d: Option<i64>,
}

impl RecordBuilder {
    pub fn foo(mut self, value: HashMap<String, String>) -> Self {
        self.foo = Some(value);
        self
    }

    pub fn _3d(mut self, value: i64) -> Self {
        self._3d = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Record`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](RecordBuilder::foo)
    /// - [`_3d`](RecordBuilder::_3d)
    pub fn build(self) -> Result<Record, BuildError> {
        Ok(Record {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
            _3d: self._3d.ok_or_else(|| BuildError::missing_field("_3d"))?,
        })
    }
}
