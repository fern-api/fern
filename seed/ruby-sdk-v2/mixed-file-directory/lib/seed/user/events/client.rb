# frozen_string_literal: true

module Seed
  module User
    module Events
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::User::Events::Client]
        def initialize(client:)
          @client = client
        end

        # List all user events.
        #
        # @option params [Integer | nil] :limit
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [Array[Seed::User::Events::Types::Event]]
        def list_events(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[limit]
          _query = {}
          _query["limit"] = params[:limit] if params.key?(:limit)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users/events/",
            query: _query
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end

        # @return [Seed::Metadata::Client]
        def metadata
          @metadata ||= Seed::User::Events::Metadata::Client.new(client: @client)
        end
      end
    end
  end
end
