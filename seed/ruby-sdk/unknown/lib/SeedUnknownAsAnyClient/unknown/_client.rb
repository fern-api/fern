# frozen_string_literal: true

module SeedUnknownAsAnyClient
  class Unknown
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Unknown]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
