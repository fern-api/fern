# frozen_string_literal: true

module Seed
  module Endpoints
    module Put
      class Client
        # @return [Seed::Endpoints::Put::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Endpoints::Put::Types::PutResponse]
        def add(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: params[:id].to_s
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Endpoints::Put::Types::PutResponse.load(_response.body)
          end

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
end
