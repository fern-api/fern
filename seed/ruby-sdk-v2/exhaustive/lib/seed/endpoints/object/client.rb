# frozen_string_literal: true

module Seed
  module Endpoints
    module Object_
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::Object_::Client]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithOptionalField]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def get_and_return_with_optional_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-optional-field",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField]
        def get_and_return_with_required_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-required-field",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithRequiredField.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithMapOfMap]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithMapOfMap]
        def get_and_return_with_map_of_map(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-with-map-of-map",
            body: Seed::Types::Object_::Types::ObjectWithMapOfMap.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithMapOfMap.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::NestedObjectWithOptionalField]
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithOptionalField]
        def get_and_return_nested_with_optional_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-optional-field",
            body: Seed::Types::Object_::Types::NestedObjectWithOptionalField.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithOptionalField.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # @option params [String] :string
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field/#{params[:string]}",
            body: Seed::Types::Object_::Types::NestedObjectWithRequiredField.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [Seed::Types::Object_::Types::NestedObjectWithRequiredField]
        def get_and_return_nested_with_required_field_as_list(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/object/get-and-return-nested-with-required-field-list",
            body: params
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::NestedObjectWithRequiredField.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
