# frozen_string_literal: true

module SeedExhaustiveClient
  class NoAuth
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [NoAuth]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
