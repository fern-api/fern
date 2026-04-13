pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BadRequestErrorBodyErrorName {
    PropertyBasedErrorTest,
}
impl fmt::Display for BadRequestErrorBodyErrorName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PropertyBasedErrorTest => "PropertyBasedErrorTest",
        };
        write!(f, "{}", s)
    }
}
