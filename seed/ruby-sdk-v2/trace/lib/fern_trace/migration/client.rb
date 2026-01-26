# frozen_string_literal: true

module FernTrace
  module Migration
    class Client
      # @param client [FernTrace::Internal::Http::RawClient]
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
      # @option params [String] :admin_key_header
      #
      # @return [Array[FernTrace::Migration::Types::Migration]]
      def get_attempted_migrations(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        headers = {}
        headers["admin-key-header"] = params[:admin_key_header] if params[:admin_key_header]

        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/migration-info/all",
          headers: headers,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
