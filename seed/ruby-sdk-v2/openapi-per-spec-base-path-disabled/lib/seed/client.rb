# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param _params [Hash]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    #
    # @example
    #   client.list_items
    #
    # @return [Array[String]]
    def list_items(request_options: {}, **_params)
      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "items",
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      return if code.between?(200, 299)

      error_class = Seed::Errors::ResponseError.subclass_for_code(code)
      raise error_class.new(response.body, code: code)
    end

    # @param client_id [String]
    # @param client_secret [String]
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(client_id:, client_secret:, base_url: nil, max_retries: 2)
      # Create an unauthenticated client for the auth endpoint
      auth_raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "X-Fern-Language" => "Ruby"
        }
      )

      # Create the auth client for token retrieval
      auth_client = Seed::Oauth::Client.new(client: auth_raw_client)

      # Create the OAuth provider with the auth client and credentials
      @auth_provider = Seed::Internal::OAuthProvider.new(
        auth_client: auth_client,
        options: { base_url: base_url, client_id: client_id, client_secret: client_secret }
      )

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_openapi-per-spec-base-path-disabled/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        auth_provider: @auth_provider,
        max_retries: max_retries
      )
    end

    # @return [Seed::Oauth::Client]
    def oauth
      @oauth ||= Seed::Oauth::Client.new(client: @raw_client)
    end
  end
end
