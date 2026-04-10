pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2TestCaseFunction {
        V2TestCaseFunctionZero(V2TestCaseFunctionZero),

        V2TestCaseFunctionOne(V2TestCaseFunctionOne),
}

impl V2TestCaseFunction {
    pub fn is_v2test_case_function_zero(&self) -> bool {
        matches!(self, Self::V2TestCaseFunctionZero(_))
    }

    pub fn is_v2test_case_function_one(&self) -> bool {
        matches!(self, Self::V2TestCaseFunctionOne(_))
    }


    pub fn as_v2test_case_function_zero(&self) -> Option<&V2TestCaseFunctionZero> {
        match self {
                    Self::V2TestCaseFunctionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2test_case_function_zero(self) -> Option<V2TestCaseFunctionZero> {
        match self {
                    Self::V2TestCaseFunctionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2test_case_function_one(&self) -> Option<&V2TestCaseFunctionOne> {
        match self {
                    Self::V2TestCaseFunctionOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2test_case_function_one(self) -> Option<V2TestCaseFunctionOne> {
        match self {
                    Self::V2TestCaseFunctionOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for V2TestCaseFunction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2TestCaseFunctionZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2TestCaseFunctionOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
