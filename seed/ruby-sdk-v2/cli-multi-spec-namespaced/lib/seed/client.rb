# frozen_string_literal: true

module Seed
  class Client
    # @param token [String]
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(token:, base_url: nil, max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_cli-multi-spec-namespaced/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::V1::Client]
    def v1
      @v1 ||= Seed::V1::Client.new(client: @raw_client)
    end

    # @return [Seed::V2::Client]
    def v2
      @v2 ||= Seed::V2::Client.new(client: @raw_client)
    end
  end
end
