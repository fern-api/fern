# frozen_string_literal: true

module Seed
  module Endpoints
    module Object_
      class Client
        # @return [Seed::Endpoints::Object_::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def get_and_return_with_optional_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-with-optional-field",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField]
        def get_and_return_with_required_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-with-required-field",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithRequiredField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithMapOfMap]
        def get_and_return_with_map_of_map(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-with-map-of-map",
            body: Seed::Types::Object_::Types::ObjectWithMapOfMap.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithMapOfMap.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::NestedObjectWithOptionalField]
        def get_and_return_nested_with_optional_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-nested-with-optional-field",
            body: Seed::Types::Object_::Types::NestedObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::NestedObjectWithOptionalField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field/#{params[:string]}",
            body: Seed::Types::Object_::Types::NestedObjectWithRequiredField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field_as_list(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field-list",
            body: params[:request]
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_integer_overflow_edge_cases(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/object/test-integer-overflow-edge-cases",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
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
