# frozen_string_literal: true

module SeedIdempotencyHeadersClient
  class Payment
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Payment]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
