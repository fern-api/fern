# frozen_string_literal: true

module Seed
  module Endpoints
    class Client
      # @return [Seed::Endpoints::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Endpoints::Client]
      def endpoints
        @endpoints ||= Seed::Endpoints::Client.new(client: @raw_client)
      end

      # @return [Seed::InlinedRequests::Client]
      def inlinedRequests
        @inlinedRequests ||= Seed::InlinedRequests::Client.new(client: @raw_client)
      end

      # @return [Seed::NoAuth::Client]
      def noAuth
        @noAuth ||= Seed::NoAuth::Client.new(client: @raw_client)
      end

      # @return [Seed::NoReqBody::Client]
      def noReqBody
        @noReqBody ||= Seed::NoReqBody::Client.new(client: @raw_client)
      end

      # @return [Seed::ReqWithHeaders::Client]
      def reqWithHeaders
        @reqWithHeaders ||= Seed::ReqWithHeaders::Client.new(client: @raw_client)
      end
    end
  end
end
