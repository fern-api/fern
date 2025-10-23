pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SpecialEnum {
    #[serde(rename = "")]
    A,
    #[serde(rename = "Hello \\\"World\\\"")]
    B,
    #[serde(rename = "Hello 'World'")]
    C,
    #[serde(rename = "Hello\\\\World")]
    D,
    #[serde(rename = "Hello\\nWorld")]
    E,
    #[serde(rename = "Hello\\rWorld")]
    F,
    #[serde(rename = "Hello\\tWorld")]
    H,
    #[serde(rename = "Hello\\fWorld")]
    I,
    #[serde(rename = "Hello\\u0008World")]
    J,
    #[serde(rename = "Hello\\vWorld")]
    K,
    #[serde(rename = "Hello\\x00World")]
    L,
    #[serde(rename = "Hello\\u0007World")]
    M,
    #[serde(rename = "Hello\\u0001World")]
    N,
    #[serde(rename = "Hello\\u0002World")]
    O,
    #[serde(rename = "Hello\\u001FWorld")]
    P,
    #[serde(rename = "Hello\\u007FWorld")]
    Q,
    #[serde(rename = "Hello\\u009FWorld")]
    R,
    #[serde(rename = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null")]
    S,
    #[serde(rename = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007")]
    T,
    #[serde(rename = "Hello 世界")]
    U,
    #[serde(rename = "café")]
    V,
    #[serde(rename = "🚀")]
    W,
    #[serde(rename = "\\\\n")]
    X,
    #[serde(rename = "\\\\")]
    Y,
    #[serde(rename = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}")]
    Z,
    #[serde(rename = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'")]
    Aa,
    #[serde(rename = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt")]
    Bb,
    #[serde(rename = "/usr/local/bin/app")]
    Cc,
    #[serde(rename = "\\\\d{3}-\\\\d{2}-\\\\d{4}")]
    Dd,
    #[serde(rename = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}")]
    Ee,
    #[serde(rename = "transcript[transcriptType=\"final\"]")]
    Ff,
    #[serde(rename = "transcript[transcriptType='final']")]
    Gg,
}
impl fmt::Display for SpecialEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::A => "",
            Self::B => "Hello \\\"World\\\"",
            Self::C => "Hello 'World'",
            Self::D => "Hello\\\\World",
            Self::E => "Hello\\nWorld",
            Self::F => "Hello\\rWorld",
            Self::H => "Hello\\tWorld",
            Self::I => "Hello\\fWorld",
            Self::J => "Hello\\u0008World",
            Self::K => "Hello\\vWorld",
            Self::L => "Hello\\x00World",
            Self::M => "Hello\\u0007World",
            Self::N => "Hello\\u0001World",
            Self::O => "Hello\\u0002World",
            Self::P => "Hello\\u001FWorld",
            Self::Q => "Hello\\u007FWorld",
            Self::R => "Hello\\u009FWorld",
            Self::S => "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null",
            Self::T => "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007",
            Self::U => "Hello 世界",
            Self::V => "café",
            Self::W => "🚀",
            Self::X => "\\\\n",
            Self::Y => "\\\\",
            Self::Z => "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}",
            Self::Aa => "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'",
            Self::Bb => "C:\\\\Users\\\\John\\\\Documents\\\\file.txt",
            Self::Cc => "/usr/local/bin/app",
            Self::Dd => "\\\\d{3}-\\\\d{2}-\\\\d{4}",
            Self::Ee => "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}",
            Self::Ff => "transcript[transcriptType=\"final\"]",
            Self::Gg => "transcript[transcriptType='final']",
        };
        write!(f, "{}", s)
    }
}
