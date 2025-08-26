# frozen_string_literal: true

module Seed
  module Migration
    class Client
      # @return [Seed::Migration::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Array[Seed::Migration::Types::Migration]]
      def get_attempted_migrations(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/migration-info/all"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
