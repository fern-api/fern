# frozen_string_literal: true

module Seed
  module User
    module Events
      class Client
        # @return [Seed::User::Events::Client]
        def initialize(client:)
          @client = client
        end

        # List all user events.
        #
        # @return [Array[Seed::User::Events::Types::Event]]
        def list_events(request_options: {}, **params)
          _query_param_names = ["limit"]
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/users/events/",
            query: _query
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Seed::Metadata::Client]
        def metadata
          @metadata ||= Seed::User::Events::Metadata::Client.new(client: @client)
        end
      end
    end
  end
end
