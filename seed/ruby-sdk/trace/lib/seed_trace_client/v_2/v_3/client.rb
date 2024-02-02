# frozen_string_literal: true

require_relative "problem/client"

module SeedTraceClient
  module V2
    module V3
      class Client
        attr_reader :request_client

        # @param client [RequestClient]
        # @return [V2::V3::Client]
        def initialize(client:)
          @problem_client = V2::V3::Problem::ProblemClient.new(request_client: @request_client)
        end
      end

      class AsyncClient
        attr_reader :client

        # @param client [AsyncRequestClient]
        # @return [V2::V3::AsyncClient]
        def initialize(client:)
          @async_problem_client = V2::V3::Problem::AsyncProblemClient.new(request_client: @request_client)
        end
      end
    end
  end
end
