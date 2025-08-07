/// Authenticates a user with the service
///
/// This method attempts to authenticate a user using their credentials. It will check both local cache and remote service if necessary.
///
/// - Parameter username: The user's login name
/// - Parameter password: The user's password
/// - Parameter rememberMe: Whether to store credentials for future use
/// - Returns: An authentication token if successful
/// - Throws: AuthenticationError if credentials are invalid
/// - Throws: NetworkError if unable to reach the service
