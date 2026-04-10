//! Request and response types for the circular-references-advanced
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 26 types for data representation

pub mod importing_a;
pub mod root_type;
pub mod a;
pub mod animal;
pub mod fruit;
pub mod node;
pub mod cat;
pub mod dog;
pub mod acai;
pub mod fig;
pub mod berry;
pub mod branch_node;
pub mod leaf_node;
pub mod nodes_wrapper;
pub mod container_value;
pub mod primitive_value;
pub mod object_value;
pub mod field_name;
pub mod field_value_zero_type;
pub mod field_value_zero;
pub mod field_value_one_type;
pub mod field_value_one;
pub mod field_value_two_type;
pub mod field_value_two;
pub mod field_value;
pub mod object_field_value;

pub use importing_a::ImportingA;
pub use root_type::RootType;
pub use a::A;
pub use animal::Animal;
pub use fruit::Fruit;
pub use node::Node;
pub use cat::Cat;
pub use dog::Dog;
pub use acai::Acai;
pub use fig::Fig;
pub use berry::Berry;
pub use branch_node::BranchNode;
pub use leaf_node::LeafNode;
pub use nodes_wrapper::NodesWrapper;
pub use container_value::ContainerValue;
pub use primitive_value::PrimitiveValue;
pub use object_value::ObjectValue;
pub use field_name::FieldName;
pub use field_value_zero_type::FieldValueZeroType;
pub use field_value_zero::FieldValueZero;
pub use field_value_one_type::FieldValueOneType;
pub use field_value_one::FieldValueOne;
pub use field_value_two_type::FieldValueTwoType;
pub use field_value_two::FieldValueTwo;
pub use field_value::FieldValue;
pub use object_field_value::ObjectFieldValue;

