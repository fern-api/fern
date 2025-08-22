# frozen_string_literal: true

module Seed
  module Package
    class Client
      # @return [Seed::Package::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def test(request_options: {}, **params)
        _query_param_names = ["for"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
