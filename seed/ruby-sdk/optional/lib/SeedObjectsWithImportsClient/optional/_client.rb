# frozen_string_literal: true

module SeedObjectsWithImportsClient
  class Optional
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Optional]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
