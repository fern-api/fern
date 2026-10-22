# frozen_string_literal: true

module Seed
  class Client
    # @param base_url [String, nil]
    # @param max_retries [Integer]
    # @param timeout [Numeric]
    #
    # @return [void]
    def initialize(base_url: nil, max_retries: 2, timeout: 60)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::DEFAULT,
        headers: {
          "User-Agent" => "fern_error-responses-shared/0.0.1",
          "X-Fern-Language" => "Ruby"
        },
        max_retries: max_retries,
        timeout: timeout
      )
    end

    # @return [Seed::Calls::Client]
    def calls
      @calls ||= Seed::Calls::Client.new(client: @raw_client)
    end

    # @return [Seed::Messages::Client]
    def messages
      @messages ||= Seed::Messages::Client.new(client: @raw_client)
    end
  end
end
