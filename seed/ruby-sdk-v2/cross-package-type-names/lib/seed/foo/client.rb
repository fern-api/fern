# frozen_string_literal: true

module Seed
  module Foo
    class Client
      # @return [Seed::Foo::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Foo::Types::ImportingType]
      def find(request_options: {}, **params)
        _query_param_names = ["optionalString"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "",
          query: _query,
          body: params
        )
        _response = @client.send(_request)
        return Seed::Foo::Types::ImportingType.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
