# frozen_string_literal: true

module SeedApiClient
  class Imdb
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Imdb]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
