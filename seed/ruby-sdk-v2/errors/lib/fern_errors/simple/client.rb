# frozen_string_literal: true

module FernErrors
  module Simple
    class Client
      # @param client [FernErrors::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernErrors::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernErrors::Simple::Types::FooResponse]
      def foo_without_endpoint_error(request_options: {}, **params)
        params = FernErrors::Internal::Types::Utils.normalize_keys(params)
        request = FernErrors::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo1",
          body: FernErrors::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernErrors::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernErrors::Simple::Types::FooResponse.load(response.body)
        else
          error_class = FernErrors::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernErrors::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernErrors::Simple::Types::FooResponse]
      def foo(request_options: {}, **params)
        params = FernErrors::Internal::Types::Utils.normalize_keys(params)
        request = FernErrors::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo2",
          body: FernErrors::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernErrors::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernErrors::Simple::Types::FooResponse.load(response.body)
        else
          error_class = FernErrors::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernErrors::Simple::Types::FooRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernErrors::Simple::Types::FooResponse]
      def foo_with_examples(request_options: {}, **params)
        params = FernErrors::Internal::Types::Utils.normalize_keys(params)
        request = FernErrors::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo3",
          body: FernErrors::Simple::Types::FooRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernErrors::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernErrors::Simple::Types::FooResponse.load(response.body)
        else
          error_class = FernErrors::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
