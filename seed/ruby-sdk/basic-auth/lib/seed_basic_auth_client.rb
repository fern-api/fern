# frozen_string_literal: true

module SeedBasicAuthClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return []
    def initialize(username:, password:, max_retries: nil, timeout_in_seconds: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param username [String]
    # @param password [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return []
    def initialize(username:, password:, max_retries: nil, timeout_in_seconds: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil)
    end
  end
end
