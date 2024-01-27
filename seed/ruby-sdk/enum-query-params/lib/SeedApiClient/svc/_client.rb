# frozen_string_literal: true

module SeedApiClient
  class Svc
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Svc]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
