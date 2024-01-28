# frozen_string_literal: true

module SeedErrorPropertyClient
  class PropertyBasedError
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [PropertyBasedError]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
