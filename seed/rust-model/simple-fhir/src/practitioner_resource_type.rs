pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PractitionerResourceType {
    Practitioner,
}
impl fmt::Display for PractitionerResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Practitioner => "Practitioner",
        };
        write!(f, "{}", s)
    }
}
