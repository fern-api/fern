# frozen_string_literal: true

require_relative "../../../requests"
require_relative "problem/client"

module SeedTraceClient
  module V2
    module V3
      class Client
        # @return [SeedTraceClient::V2::V3::ProblemClient]
        attr_reader :problem

        # @param request_client [SeedTraceClient::RequestClient]
        # @return [SeedTraceClient::V2::V3::Client]
        def initialize(request_client:)
          @problem = SeedTraceClient::V2::V3::ProblemClient.new(request_client: request_client)
        end
      end

      class AsyncClient
        # @return [SeedTraceClient::V2::V3::AsyncProblemClient]
        attr_reader :problem

        # @param request_client [SeedTraceClient::AsyncRequestClient]
        # @return [SeedTraceClient::V2::V3::AsyncClient]
        def initialize(request_client:)
          @problem = SeedTraceClient::V2::V3::AsyncProblemClient.new(request_client: request_client)
        end
      end
    end
  end
end
