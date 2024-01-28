# frozen_string_literal: true

module SeedBasicAuthClient
  class BasicAuth
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [BasicAuth]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
