pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2V3TestCaseFunction {
        V2V3TestCaseFunctionZero(V2V3TestCaseFunctionZero),

        V2V3TestCaseFunctionOne(V2V3TestCaseFunctionOne),
}

impl V2V3TestCaseFunction {
    pub fn is_v2v3test_case_function_zero(&self) -> bool {
        matches!(self, Self::V2V3TestCaseFunctionZero(_))
    }

    pub fn is_v2v3test_case_function_one(&self) -> bool {
        matches!(self, Self::V2V3TestCaseFunctionOne(_))
    }


    pub fn as_v2v3test_case_function_zero(&self) -> Option<&V2V3TestCaseFunctionZero> {
        match self {
                    Self::V2V3TestCaseFunctionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3test_case_function_zero(self) -> Option<V2V3TestCaseFunctionZero> {
        match self {
                    Self::V2V3TestCaseFunctionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2v3test_case_function_one(&self) -> Option<&V2V3TestCaseFunctionOne> {
        match self {
                    Self::V2V3TestCaseFunctionOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3test_case_function_one(self) -> Option<V2V3TestCaseFunctionOne> {
        match self {
                    Self::V2V3TestCaseFunctionOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for V2V3TestCaseFunction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2V3TestCaseFunctionZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2V3TestCaseFunctionOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
