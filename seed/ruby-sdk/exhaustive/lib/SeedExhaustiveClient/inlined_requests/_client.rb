# frozen_string_literal: true

module SeedExhaustiveClient
  class InlinedRequests
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [InlinedRequests]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
