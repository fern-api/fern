
module Seed
  module Package
    class Client
      # @return [Seed::Package::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def test(request_options: {}, **params)
        _query_param_names = [
          ["for"],
          %i[for]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "POST",
          path: "",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

    end
  end
end
