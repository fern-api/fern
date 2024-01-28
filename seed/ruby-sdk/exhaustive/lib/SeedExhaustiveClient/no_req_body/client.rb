# frozen_string_literal: true

module SeedExhaustiveClient
  class NoReqBody
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [NoReqBody]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
