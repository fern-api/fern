# frozen_string_literal: true

module SeedAudiencesClient
  class Foo
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Foo]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
