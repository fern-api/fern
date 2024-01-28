# frozen_string_literal: true

module SeedMultiUrlEnvironmentClient
  class Ec2
    attr_reader :client

    # @param client [TODOMERGECLIENT]
    # @return [Ec2]
    def initialize(client:)
      # @type [TODOMERGECLIENT]
      @client = client
    end
  end
end
