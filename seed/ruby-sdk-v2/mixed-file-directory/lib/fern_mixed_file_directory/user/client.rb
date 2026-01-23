# frozen_string_literal: true

module FernMixedFileDirectory
  module User
    class Client
      # @param client [FernMixedFileDirectory::Internal::Http::RawClient]
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
      # @return [Array[FernMixedFileDirectory::User::Types::User]]
      def list(request_options: {}, **params)
        params = FernMixedFileDirectory::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[limit]
        query_params = {}
        query_params["limit"] = params[:limit] if params.key?(:limit)
        params.except(*query_param_names)

        request = FernMixedFileDirectory::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/users/",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMixedFileDirectory::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernMixedFileDirectory::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @return [FernMixedFileDirectory::Events::Client]
      def events
        @events ||= FernMixedFileDirectory::User::Events::Client.new(client: @client)
      end
    end
  end
end
