//! Request and response types for the IdempotencyHeaders
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod payment_currency;
pub mod create_payment_request;

pub use payment_currency::Currency;
pub use create_payment_request::CreatePaymentRequest;

