# frozen_string_literal: true

module FernResponseProperty
  module Service
    class Client
      # @param client [FernResponseProperty::Internal::Http::RawClient]
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
      # @return [FernResponseProperty::Service::Types::Response]
      def get_movie(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Service::Types::Response.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernResponseProperty::Service::Types::Response]
      def get_movie_docs(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Service::Types::Response.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernResponseProperty::Types::StringResponse]
      def get_movie_name(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Types::StringResponse.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernResponseProperty::Service::Types::Response]
      def get_movie_metadata(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Service::Types::Response.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernResponseProperty::Service::Types::Response, nil]
      def get_optional_movie(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernResponseProperty::Service::Types::WithDocs, nil]
      def get_optional_movie_docs(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Service::Types::OptionalWithDocs.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernResponseProperty::Types::StringResponse, nil]
      def get_optional_movie_name(request_options: {}, **params)
        params = FernResponseProperty::Internal::Types::Utils.normalize_keys(params)
        request = FernResponseProperty::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "movie",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernResponseProperty::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernResponseProperty::Types::OptionalStringResponse.load(response.body)
        else
          error_class = FernResponseProperty::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
