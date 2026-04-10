pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PatientResourceType {
    Patient,
}
impl fmt::Display for PatientResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Patient => "Patient",
        };
        write!(f, "{}", s)
    }
}
