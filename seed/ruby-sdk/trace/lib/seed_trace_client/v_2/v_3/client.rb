# frozen_string_literal: true

require_relative "../../../requests"
require_relative "problem/client"

module SeedTraceClient
  module V2
    module V3
      class Client
        # @param request_client [RequestClient]
        # @return [V2::V3::Client]
        def initialize(request_client:)
          @problem = V2::V3::ProblemClient.new(request_client: request_client)
        end
      end

      class AsyncClient
        # @param request_client [RequestClient]
        # @return [V2::V3::AsyncClient]
        def initialize(request_client:)
          @problem = V2::V3::AsyncProblemClient.new(request_client: request_client)
        end
      end
    end
  end
end
