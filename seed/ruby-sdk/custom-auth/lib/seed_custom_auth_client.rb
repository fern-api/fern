# frozen_string_literal: true

module SeedCustomAuthClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return []
    def initialize(custom_auth_scheme:, max_retries: nil, timeout_in_seconds: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param custom_auth_scheme [String]
    # @param additional_headers [Hash{String => Object}]
    # @param additional_query_parameters [Hash{String => Object}]
    # @param additional_body_parameters [Hash{String => Object}]
    # @return []
    def initialize(custom_auth_scheme:, max_retries: nil, timeout_in_seconds: nil, additional_headers: nil,
                   additional_query_parameters: nil, additional_body_parameters: nil)
    end
  end
end
