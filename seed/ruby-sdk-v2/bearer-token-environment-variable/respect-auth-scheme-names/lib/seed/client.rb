# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param api_key [String]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, api_key: ENV.fetch("COURIER_API_KEY", nil), max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_bearer-token-environment-variable/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{api_key}",
          "X-API-Version" => "1.0.0"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
