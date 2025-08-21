# frozen_string_literal: true

module Seed
  module NoAuth
    class Client
      # @return [Seed::NoAuth::Client]
      def initialize(client:)
        @client = client
      end

      # POST request with no auth
      #
      # @return [bool]
      def post_with_no_auth(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/no-auth",
          body: params[:request]
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
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
