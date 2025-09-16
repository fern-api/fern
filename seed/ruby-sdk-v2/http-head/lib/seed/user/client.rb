
module Seed
  module User
    class Client
      # @return [Seed::User::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def head(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "HEAD",
          path: "/users"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # @return [Array[Seed::User::Types::User]]
      def list(request_options: {}, **params)
        _query_param_names = [
          ["limit"],
          %i[limit]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "GET",
          path: "/users",
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
