# frozen_string_literal: true

module SeedUndiscriminatedUnionsClient
  class Union
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Union]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
