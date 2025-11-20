# frozen_string_literal: true

module Seed
  module Endpoints
    module HttpMethods
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::HttpMethods::Client]
        def initialize(client:)
          @client = client
        end

        # @option params [String] :id
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [String]
        def test_get(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/http-methods/#{params[:id]}"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_post(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/http-methods",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h
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

        # @option params [String] :id
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_put(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/http-methods/#{params[:id]}",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h
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

        # @option params [String] :id
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Seed::Types::Object_::Types::ObjectWithOptionalField]
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_patch(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PATCH",
            path: "/http-methods/#{params[:id]}",
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

        # @option params [String] :id
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [bool]
        def test_delete(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "DELETE",
            path: "/http-methods/#{params[:id]}"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
