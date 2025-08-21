# frozen_string_literal: true

module Seed
  module Endpoints
    module Urls
      class Client
        # @return [Seed::Endpoints::Urls::Client]
        def initialize(client:)
          @client = client
        end

        # @return [String]
        def with_mixed_case(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def no_ending_slash(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def with_ending_slash(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [String]
        def with_underscores(request_options: {}, **params)
          _request = params
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
end
