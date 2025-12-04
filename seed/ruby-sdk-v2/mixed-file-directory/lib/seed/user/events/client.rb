# frozen_string_literal: true

module Seed
  module User
    module Events
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # List all user events.
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
        # @return [Array[Seed::User::Events::Types::Event]]
        def list_events(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          query_param_names = %i[limit]
          query_params = {}
          query_params["limit"] = params[:limit] if params.key?(:limit)
          params.except(*query_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users/events/",
            query: query_params
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

        # @return [Seed::Metadata::Client]
        def metadata
          @metadata ||= Seed::User::Events::Metadata::Client.new(client: @client)
        end
      end
    end
  end
end
