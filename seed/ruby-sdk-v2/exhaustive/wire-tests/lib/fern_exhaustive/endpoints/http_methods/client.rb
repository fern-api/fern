# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module HttpMethods
      class Client
        # @param client [FernExhaustive::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @return [String]
        def test_get(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/http-methods/#{params[:id]}",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [FernExhaustive::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [FernExhaustive::Types::Object_::Types::ObjectWithOptionalField]
        def test_post(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/http-methods",
            body: FernExhaustive::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernExhaustive::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [FernExhaustive::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @return [FernExhaustive::Types::Object_::Types::ObjectWithOptionalField]
        def test_put(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/http-methods/#{params[:id]}",
            body: FernExhaustive::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernExhaustive::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [FernExhaustive::Types::Object_::Types::ObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @return [FernExhaustive::Types::Object_::Types::ObjectWithOptionalField]
        def test_patch(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PATCH",
            path: "/http-methods/#{params[:id]}",
            body: FernExhaustive::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernExhaustive::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @return [Boolean]
        def test_delete(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "DELETE",
            path: "/http-methods/#{params[:id]}",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
