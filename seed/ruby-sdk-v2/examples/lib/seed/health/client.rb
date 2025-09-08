# frozen_string_literal: true

module Seed
  module Health
    class Client
      # @return [Seed::Health::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Client]
      def service
        @service ||= Seed::Health::Service::Client.new(client: @client)
      end
    end
  end
end
