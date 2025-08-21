# frozen_string_literal: true

module Seed
  module Endpoints
    module HttpMethods
      class Client
        # @return [Seed::Endpoints::HttpMethods::Client]
        def initialize(client:)
          @client = client
        end

        # @return [String]
        def test_get(request_options: {}, **params)
          _request = params
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_post(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/http-methods",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_put(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: "/http-methods/#{params[:id]}",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_patch(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PATCH",
            path: "/http-methods/#{params[:id]}",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          end

          raise _response.body
        end

        # @return [bool]
        def test_delete(request_options: {}, **params)
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
