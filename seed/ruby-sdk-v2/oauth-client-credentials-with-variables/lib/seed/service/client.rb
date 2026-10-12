# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      # @param root_variable [String, nil]
      #
      # @return [void]
      def initialize(client:, root_variable: nil)
        @client = client
        @root_variable = root_variable
      end

      # @param request_options [Hash]
      # @param _params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.post
      #
      # @return [untyped]
      def post(request_options: {}, **_params)
        raise ArgumentError, "The `root_variable` SDK variable is required. Pass `root_variable:` to Seed::Client.new." if @root_variable.nil?

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/service/#{URI.encode_uri_component(@root_variable.to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
