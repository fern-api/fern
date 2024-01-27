# frozen_string_literal: true

module SeedLiteralClient
  class Literal
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Literal]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
