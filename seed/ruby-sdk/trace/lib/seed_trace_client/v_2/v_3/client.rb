# frozen_string_literal: true

require_relative "problem/client"

module SeedTraceClient
  module V2
    module V3
      class Client
        attr_reader :request_client

        # @param client [RequestClient]
        # @return []
        def initialize(client:)
          @problem_client = ProblemClient.initialize(request_client: @request_client)
        end
      end

      class AsyncClient
        attr_reader :client

        # @param client [AsyncRequestClient]
        # @return []
        def initialize(client:)
          @async_problem_client = AsyncProblemClient.initialize(request_client: @request_client)
        end
      end
    end
  end
end
