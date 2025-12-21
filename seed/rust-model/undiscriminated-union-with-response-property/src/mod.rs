//! Request and response types for the UndiscriminatedUnionWithResponseProperty
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 4 types for data representation

pub mod union_response;
pub mod union_list_response;
pub mod my_union;
pub mod variant_a;
pub mod variant_b;
pub mod variant_c;

pub use union_response::UnionResponse;
pub use union_list_response::UnionListResponse;
pub use my_union::MyUnion;
pub use variant_a::VariantA;
pub use variant_b::VariantB;
pub use variant_c::VariantC;

