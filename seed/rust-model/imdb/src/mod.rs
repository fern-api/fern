//! Request and response types for the imdb
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod movie_id;
pub mod movie;
pub mod create_movie_request;

pub use movie_id::MovieId;
pub use movie::Movie;
pub use create_movie_request::CreateMovieRequest;

