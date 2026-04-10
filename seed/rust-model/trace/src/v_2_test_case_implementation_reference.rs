pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2TestCaseImplementationReference {
        V2TestCaseImplementationReferenceType(V2TestCaseImplementationReferenceType),

        V2TestCaseImplementationReferenceOne(V2TestCaseImplementationReferenceOne),
}

impl V2TestCaseImplementationReference {
    pub fn is_v2test_case_implementation_reference_type(&self) -> bool {
        matches!(self, Self::V2TestCaseImplementationReferenceType(_))
    }

    pub fn is_v2test_case_implementation_reference_one(&self) -> bool {
        matches!(self, Self::V2TestCaseImplementationReferenceOne(_))
    }


    pub fn as_v2test_case_implementation_reference_type(&self) -> Option<&V2TestCaseImplementationReferenceType> {
        match self {
                    Self::V2TestCaseImplementationReferenceType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2test_case_implementation_reference_type(self) -> Option<V2TestCaseImplementationReferenceType> {
        match self {
                    Self::V2TestCaseImplementationReferenceType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2test_case_implementation_reference_one(&self) -> Option<&V2TestCaseImplementationReferenceOne> {
        match self {
                    Self::V2TestCaseImplementationReferenceOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2test_case_implementation_reference_one(self) -> Option<V2TestCaseImplementationReferenceOne> {
        match self {
                    Self::V2TestCaseImplementationReferenceOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for V2TestCaseImplementationReference {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2TestCaseImplementationReferenceType(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2TestCaseImplementationReferenceOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
