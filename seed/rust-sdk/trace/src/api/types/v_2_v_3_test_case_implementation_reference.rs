pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2V3TestCaseImplementationReference {
    V2V3TestCaseImplementationReferenceType(V2V3TestCaseImplementationReferenceType),

    V2V3TestCaseImplementationReferenceOne(V2V3TestCaseImplementationReferenceOne),
}

impl V2V3TestCaseImplementationReference {
    pub fn is_v2v3test_case_implementation_reference_type(&self) -> bool {
        matches!(self, Self::V2V3TestCaseImplementationReferenceType(_))
    }

    pub fn is_v2v3test_case_implementation_reference_one(&self) -> bool {
        matches!(self, Self::V2V3TestCaseImplementationReferenceOne(_))
    }

    pub fn as_v2v3test_case_implementation_reference_type(
        &self,
    ) -> Option<&V2V3TestCaseImplementationReferenceType> {
        match self {
            Self::V2V3TestCaseImplementationReferenceType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2v3test_case_implementation_reference_type(
        self,
    ) -> Option<V2V3TestCaseImplementationReferenceType> {
        match self {
            Self::V2V3TestCaseImplementationReferenceType(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2v3test_case_implementation_reference_one(
        &self,
    ) -> Option<&V2V3TestCaseImplementationReferenceOne> {
        match self {
            Self::V2V3TestCaseImplementationReferenceOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2v3test_case_implementation_reference_one(
        self,
    ) -> Option<V2V3TestCaseImplementationReferenceOne> {
        match self {
            Self::V2V3TestCaseImplementationReferenceOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for V2V3TestCaseImplementationReference {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2V3TestCaseImplementationReferenceType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2V3TestCaseImplementationReferenceOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
