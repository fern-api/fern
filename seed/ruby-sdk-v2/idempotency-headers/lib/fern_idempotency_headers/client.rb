# frozen_string_literal: true

module FernIdempotencyHeaders
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = FernIdempotencyHeaders::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_idempotency-headers/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [FernIdempotencyHeaders::Payment::Client]
    def payment
      @payment ||= FernIdempotencyHeaders::Payment::Client.new(client: @raw_client)
    end
  end
end
