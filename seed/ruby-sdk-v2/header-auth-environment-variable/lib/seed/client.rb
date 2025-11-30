# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param header_token_auth [String]
    #
    # @return [void]
    def initialize(base_url:, header_token_auth: ENV.fetch("HEADER_TOKEN_ENV_VAR", nil))
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent": "fern_header-auth-environment-variable/0.0.1",
          "X-Fern-Language": "Ruby",
          "x-api-key": "test_prefix #{header_token_auth}"
        }
      )
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
