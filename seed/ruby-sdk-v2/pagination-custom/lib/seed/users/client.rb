# frozen_string_literal: true

module Seed
  module Users
    class Client
      # @return [Seed::Users::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::UsernameCursor]
      def list_usernames_custom(request_options: {}, **params)
        _query_param_names = ["starting_after"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        return Seed::Types::UsernameCursor.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
