pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ObjectType {
    Foo,
    Bar,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for ObjectType {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Foo => serializer.serialize_str("FOO"),
            Self::Bar => serializer.serialize_str("BAR"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for ObjectType {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "FOO" => Ok(Self::Foo),
            "BAR" => Ok(Self::Bar),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for ObjectType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Foo => write!(f, "FOO"),
            Self::Bar => write!(f, "BAR"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
