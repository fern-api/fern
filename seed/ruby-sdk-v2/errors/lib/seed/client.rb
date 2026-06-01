# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    #
    # @return [void]
    def initialize(base_url: nil, max_retries: 2)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_errors/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries
      )
    end

    # @return [Seed::Simple::Client]
    def simple
      @simple ||= Seed::Simple::Client.new(client: @raw_client)
    end
  end
end
