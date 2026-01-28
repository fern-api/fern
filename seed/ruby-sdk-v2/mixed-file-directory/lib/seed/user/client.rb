# frozen_string_literal: true

module Seed
  module User
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # List all users.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :limit
      #
      # @return [Array[Seed::User::Types::User]]
      def list(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users/",
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

      # @return [Seed::Events::Client]
      def events
        @events ||= Seed::User::Events::Client.new(client: @client)
      end
    end
  end
end
