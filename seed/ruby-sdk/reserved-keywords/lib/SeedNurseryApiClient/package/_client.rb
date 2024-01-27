# frozen_string_literal: true

module SeedNurseryApiClient
  class Package
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Package]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
