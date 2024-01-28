# frozen_string_literal: true

module SeedExhaustiveClient
  class ReqWithHeaders
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [ReqWithHeaders]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
