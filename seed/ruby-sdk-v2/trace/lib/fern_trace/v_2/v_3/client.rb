# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      class Client
        # @param client [FernTrace::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @return [FernTrace::Problem::Client]
        def problem
          @problem ||= FernTrace::V2::V3::Problem::Client.new(client: @client)
        end
      end
    end
  end
end
