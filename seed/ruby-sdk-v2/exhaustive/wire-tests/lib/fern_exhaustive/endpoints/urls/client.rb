# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Urls
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
        #
        # @return [String]
        def with_mixed_case(request_options: {}, **params)
          FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/urls/MixedCase",
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
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [String]
        def no_ending_slash(request_options: {}, **params)
          FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/urls/no-ending-slash",
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
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [String]
        def with_ending_slash(request_options: {}, **params)
          FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/urls/with-ending-slash/",
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
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [String]
        def with_underscores(request_options: {}, **params)
          FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/urls/with_underscores",
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
