# frozen_string_literal: true

module Seed
  class Client
    # @param token [String]
    # @param base_url [String, nil]
    # @param environment [Hash[Symbol, String], nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(token:, base_url: nil, environment: Seed::Environment::PRODUCTION, max_retries: 2)
      @base_url = base_url
      @environment = environment

      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || environment&.dig(:rest),
        headers: {
          "User-Agent" => "fern_websocket-multi-url/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        },
        max_retries: max_retries
      )
    end
  end
end
