# frozen_string_literal: true

module SeedLiteralHeadersClient
  class OnlyLiteralHeaders
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [OnlyLiteralHeaders]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
