# frozen_string_literal: true

module Seed
  module V2
    module V3
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Problem::Client]
        def problem
          @problem ||= Seed::V2::V3::Problem::Client.new(client: @client)
        end
      end
    end
  end
end
