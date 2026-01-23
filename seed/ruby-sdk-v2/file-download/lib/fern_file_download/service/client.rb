# frozen_string_literal: true

module FernFileDownload
  module Service
    class Client
      # @param client [FernFileDownload::Internal::Http::RawClient]
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
      # @return [untyped]
      def simple(request_options: {}, **params)
        FernFileDownload::Internal::Types::Utils.normalize_keys(params)
        request = FernFileDownload::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/snippet",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernFileDownload::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernFileDownload::Errors::ResponseError.subclass_for_code(code)
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
      # @return [untyped]
      def download_file(request_options: {}, **params)
        FernFileDownload::Internal::Types::Utils.normalize_keys(params)
        request = FernFileDownload::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernFileDownload::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernFileDownload::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
