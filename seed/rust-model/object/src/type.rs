pub use crate::prelude::*;

/// Exercises all of the built-in types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    #[serde(default)]
    pub one: i64,
    #[serde(default)]
    pub two: f64,
    #[serde(default)]
    pub three: String,
    #[serde(default)]
    pub four: bool,
    #[serde(default)]
    pub five: i64,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub six: DateTime<FixedOffset>,
    #[serde(default)]
    pub seven: NaiveDate,
    #[serde(default)]
    pub eight: Uuid,
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub nine: Vec<u8>,
    #[serde(default)]
    pub ten: Vec<i64>,
    #[serde(default)]
    pub eleven: HashSet<ordered_float::OrderedFloat<f64>>,
    #[serde(default)]
    pub twelve: HashMap<String, bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thirteen: Option<i64>,
    pub fourteen: serde_json::Value,
    #[serde(default)]
    pub fifteen: Vec<Vec<i64>>,
    #[serde(default)]
    pub sixteen: Vec<HashMap<String, i64>>,
    #[serde(default)]
    pub seventeen: Vec<Option<Uuid>>,
    pub eighteen: String,
    #[serde(default)]
    pub nineteen: Name,
    #[serde(default)]
    pub twenty: i64,
    #[serde(default)]
    pub twentyone: i64,
    #[serde(default)]
    pub twentytwo: f64,
    #[serde(default)]
    #[serde(with = "crate::core::bigint_string")]
    pub twentythree: num_bigint::BigInt,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub twentyfour: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfive: Option<NaiveDate>,
}

impl Type {
    pub fn builder() -> TypeBuilder {
        <TypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeBuilder {
    one: Option<i64>,
    two: Option<f64>,
    three: Option<String>,
    four: Option<bool>,
    five: Option<i64>,
    six: Option<DateTime<FixedOffset>>,
    seven: Option<NaiveDate>,
    eight: Option<Uuid>,
    nine: Option<Vec<u8>>,
    ten: Option<Vec<i64>>,
    eleven: Option<HashSet<ordered_float::OrderedFloat<f64>>>,
    twelve: Option<HashMap<String, bool>>,
    thirteen: Option<i64>,
    fourteen: Option<serde_json::Value>,
    fifteen: Option<Vec<Vec<i64>>>,
    sixteen: Option<Vec<HashMap<String, i64>>>,
    seventeen: Option<Vec<Option<Uuid>>>,
    eighteen: Option<String>,
    nineteen: Option<Name>,
    twenty: Option<i64>,
    twentyone: Option<i64>,
    twentytwo: Option<f64>,
    twentythree: Option<num_bigint::BigInt>,
    twentyfour: Option<DateTime<FixedOffset>>,
    twentyfive: Option<NaiveDate>,
}

impl TypeBuilder {
    pub fn one(mut self, value: i64) -> Self {
        self.one = Some(value);
        self
    }

    pub fn two(mut self, value: f64) -> Self {
        self.two = Some(value);
        self
    }

    pub fn three(mut self, value: impl Into<String>) -> Self {
        self.three = Some(value.into());
        self
    }

    pub fn four(mut self, value: bool) -> Self {
        self.four = Some(value);
        self
    }

    pub fn five(mut self, value: i64) -> Self {
        self.five = Some(value);
        self
    }

    pub fn six(mut self, value: DateTime<FixedOffset>) -> Self {
        self.six = Some(value);
        self
    }

    pub fn seven(mut self, value: NaiveDate) -> Self {
        self.seven = Some(value);
        self
    }

    pub fn eight(mut self, value: Uuid) -> Self {
        self.eight = Some(value);
        self
    }

    pub fn nine(mut self, value: Vec<u8>) -> Self {
        self.nine = Some(value);
        self
    }

    pub fn ten(mut self, value: Vec<i64>) -> Self {
        self.ten = Some(value);
        self
    }

    pub fn eleven(mut self, value: HashSet<ordered_float::OrderedFloat<f64>>) -> Self {
        self.eleven = Some(value);
        self
    }

    pub fn twelve(mut self, value: HashMap<String, bool>) -> Self {
        self.twelve = Some(value);
        self
    }

    pub fn thirteen(mut self, value: i64) -> Self {
        self.thirteen = Some(value);
        self
    }

    pub fn fourteen(mut self, value: serde_json::Value) -> Self {
        self.fourteen = Some(value);
        self
    }

    pub fn fifteen(mut self, value: Vec<Vec<i64>>) -> Self {
        self.fifteen = Some(value);
        self
    }

    pub fn sixteen(mut self, value: Vec<HashMap<String, i64>>) -> Self {
        self.sixteen = Some(value);
        self
    }

    pub fn seventeen(mut self, value: Vec<Option<Uuid>>) -> Self {
        self.seventeen = Some(value);
        self
    }

    pub fn eighteen(mut self, value: impl Into<String>) -> Self {
        self.eighteen = Some(value.into());
        self
    }

    pub fn nineteen(mut self, value: Name) -> Self {
        self.nineteen = Some(value);
        self
    }

    pub fn twenty(mut self, value: i64) -> Self {
        self.twenty = Some(value);
        self
    }

    pub fn twentyone(mut self, value: i64) -> Self {
        self.twentyone = Some(value);
        self
    }

    pub fn twentytwo(mut self, value: f64) -> Self {
        self.twentytwo = Some(value);
        self
    }

    pub fn twentythree(mut self, value: num_bigint::BigInt) -> Self {
        self.twentythree = Some(value);
        self
    }

    pub fn twentyfour(mut self, value: DateTime<FixedOffset>) -> Self {
        self.twentyfour = Some(value);
        self
    }

    pub fn twentyfive(mut self, value: NaiveDate) -> Self {
        self.twentyfive = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Type`].
    /// This method will fail if any of the following fields are not set:
    /// - [`one`](TypeBuilder::one)
    /// - [`two`](TypeBuilder::two)
    /// - [`three`](TypeBuilder::three)
    /// - [`four`](TypeBuilder::four)
    /// - [`five`](TypeBuilder::five)
    /// - [`six`](TypeBuilder::six)
    /// - [`seven`](TypeBuilder::seven)
    /// - [`eight`](TypeBuilder::eight)
    /// - [`nine`](TypeBuilder::nine)
    /// - [`ten`](TypeBuilder::ten)
    /// - [`eleven`](TypeBuilder::eleven)
    /// - [`twelve`](TypeBuilder::twelve)
    /// - [`fourteen`](TypeBuilder::fourteen)
    /// - [`fifteen`](TypeBuilder::fifteen)
    /// - [`sixteen`](TypeBuilder::sixteen)
    /// - [`seventeen`](TypeBuilder::seventeen)
    /// - [`eighteen`](TypeBuilder::eighteen)
    /// - [`nineteen`](TypeBuilder::nineteen)
    /// - [`twenty`](TypeBuilder::twenty)
    /// - [`twentyone`](TypeBuilder::twentyone)
    /// - [`twentytwo`](TypeBuilder::twentytwo)
    /// - [`twentythree`](TypeBuilder::twentythree)
    pub fn build(self) -> Result<Type, BuildError> {
        Ok(Type {
            one: self.one.ok_or_else(|| BuildError::missing_field("one"))?,
            two: self.two.ok_or_else(|| BuildError::missing_field("two"))?,
            three: self.three.ok_or_else(|| BuildError::missing_field("three"))?,
            four: self.four.ok_or_else(|| BuildError::missing_field("four"))?,
            five: self.five.ok_or_else(|| BuildError::missing_field("five"))?,
            six: self.six.ok_or_else(|| BuildError::missing_field("six"))?,
            seven: self.seven.ok_or_else(|| BuildError::missing_field("seven"))?,
            eight: self.eight.ok_or_else(|| BuildError::missing_field("eight"))?,
            nine: self.nine.ok_or_else(|| BuildError::missing_field("nine"))?,
            ten: self.ten.ok_or_else(|| BuildError::missing_field("ten"))?,
            eleven: self.eleven.ok_or_else(|| BuildError::missing_field("eleven"))?,
            twelve: self.twelve.ok_or_else(|| BuildError::missing_field("twelve"))?,
            thirteen: self.thirteen,
            fourteen: self.fourteen.ok_or_else(|| BuildError::missing_field("fourteen"))?,
            fifteen: self.fifteen.ok_or_else(|| BuildError::missing_field("fifteen"))?,
            sixteen: self.sixteen.ok_or_else(|| BuildError::missing_field("sixteen"))?,
            seventeen: self.seventeen.ok_or_else(|| BuildError::missing_field("seventeen"))?,
            eighteen: self.eighteen.ok_or_else(|| BuildError::missing_field("eighteen"))?,
            nineteen: self.nineteen.ok_or_else(|| BuildError::missing_field("nineteen"))?,
            twenty: self.twenty.ok_or_else(|| BuildError::missing_field("twenty"))?,
            twentyone: self.twentyone.ok_or_else(|| BuildError::missing_field("twentyone"))?,
            twentytwo: self.twentytwo.ok_or_else(|| BuildError::missing_field("twentytwo"))?,
            twentythree: self.twentythree.ok_or_else(|| BuildError::missing_field("twentythree"))?,
            twentyfour: self.twentyfour,
            twentyfive: self.twentyfive,
        })
    }
}
