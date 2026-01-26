# frozen_string_literal: true

module FernHeaderAuth
  class Client
    # @param base_url [String, nil]
    # @param header_token_auth [String]
    #
    # @return [void]
    def initialize(header_token_auth:, base_url: nil)
      @raw_client = FernHeaderAuth::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_header-auth/0.0.1",
          "X-Fern-Language" => "Ruby",
          "x-api-key" => "test_prefix #{header_token_auth}"
        }
      )
    end

    # @return [FernHeaderAuth::Service::Client]
    def service
      @service ||= FernHeaderAuth::Service::Client.new(client: @raw_client)
    end
  end
end
