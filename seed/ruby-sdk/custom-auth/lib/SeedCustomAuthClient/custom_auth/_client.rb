# frozen_string_literal: true

module SeedCustomAuthClient
  class CustomAuth
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [CustomAuth]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
