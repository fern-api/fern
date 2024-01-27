# frozen_string_literal: true

module SeedLiteralHeadersClient
  class NoHeaders
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [NoHeaders]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
