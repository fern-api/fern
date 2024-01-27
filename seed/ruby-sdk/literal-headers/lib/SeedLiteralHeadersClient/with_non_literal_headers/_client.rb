# frozen_string_literal: true

module SeedLiteralHeadersClient
  class WithNonLiteralHeaders
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [WithNonLiteralHeaders]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
