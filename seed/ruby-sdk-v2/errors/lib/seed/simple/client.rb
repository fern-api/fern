# frozen_string_literal: true

module Seed
  module Simple
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.simple.foo_without_endpoint_error(bar: "bar")
      #
      # @return [Seed::Simple::Types::FooResponse]
      def foo_without_endpoint_error(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo1",
          body: Seed::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          begin
            (response.body.to_s.empty? ? nil : Seed::Simple::Types::FooResponse.load(response.body))
          rescue ::JSON::ParserError
            raise Seed::Errors::ResponseError.new(response.body, code: code)
          end
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            404 => Seed::Commons::Types::ErrorBody,
            400 => Seed::Commons::Types::ErrorBody,
            500 => Seed::Commons::Types::ErrorBody
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.simple.foo(bar: "bar")
      #
      # @return [Seed::Simple::Types::FooResponse]
      def foo(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo2",
          body: Seed::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          begin
            (response.body.to_s.empty? ? nil : Seed::Simple::Types::FooResponse.load(response.body))
          rescue ::JSON::ParserError
            raise Seed::Errors::ResponseError.new(response.body, code: code)
          end
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            429 => Seed::Commons::Types::ErrorBody,
            500 => Seed::Commons::Types::ErrorBody,
            404 => Seed::Commons::Types::ErrorBody,
            400 => Seed::Commons::Types::ErrorBody
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.simple.foo_with_examples(bar: "hello")
      #
      # @return [Seed::Simple::Types::FooResponse]
      def foo_with_examples(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo3",
          body: Seed::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          begin
            (response.body.to_s.empty? ? nil : Seed::Simple::Types::FooResponse.load(response.body))
          rescue ::JSON::ParserError
            raise Seed::Errors::ResponseError.new(response.body, code: code)
          end
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            429 => Seed::Commons::Types::ErrorBody,
            500 => Seed::Commons::Types::ErrorBody,
            404 => Seed::Commons::Types::ErrorBody,
            400 => Seed::Commons::Types::ErrorBody
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end
    end
  end
end
