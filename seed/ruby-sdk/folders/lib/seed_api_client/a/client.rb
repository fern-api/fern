# frozen_string_literal: true
require_relative "../../requests"
require_relative "c/client"
require_relative "../../requests"

module SeedApiClient
  module A
    class Client
      # @param request_client [RequestClient] 
      # @return [A::Client]
      def initialize(request_client:)
        @ = A::C::Client.new(request_client: request_client)
      end
    end
    class AsyncClient
      # @param request_client [RequestClient] 
      # @return [A::AsyncClient]
      def initialize(request_client:)
        @ = A::C::AsyncClient.new(request_client: request_client)
      end
    end
  end
end