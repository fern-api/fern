# frozen_string_literal: true

module Seed
  module PropertyBasedError
    class Client
      # @return [Seed::PropertyBasedError::Client]
      def initialize(client:)
        @client = client
      end

      # GET request that always throws an error
      #
      # @return [String]
      def throw_error(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "property-based-error"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
