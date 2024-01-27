# frozen_string_literal: true

module SeedMultiUrlEnvironmentClient
  class S3
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [S3]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
