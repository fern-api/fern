# frozen_string_literal: true

module Seed
  module Events
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Subscribe to events with a oneOf-style query parameter that may be a
      # scalar enum value or a list of enum values.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Events::Types::EventTypeParam, nil] :event_type
      # @option params [Seed::Events::Types::StringOrListParam, nil] :tags
      #
      # @return [String]
      def subscribe(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["event_type"] = params[:event_type] if params.key?(:event_type)
        query_params["tags"] = params[:tags] if params.key?(:tags)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/events",
          query: query_params,
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
