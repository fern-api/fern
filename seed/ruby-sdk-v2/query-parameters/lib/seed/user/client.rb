
module Seed
  module User
    class Client
      # @return [Seed::User::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::User::Types::User]
      def get_username(request_options: {}, **params)
        _query_param_names = [
          ["limit", "id", "date", "deadline", "bytes", "user", "userList", "optionalDeadline", "keyValue", "optionalString", "nestedUser", "optionalUser", "excludeUser", "filter"],
          %i[limit id date deadline bytes user userList optionalDeadline keyValue optionalString nestedUser optionalUser excludeUser filter]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "GET",
          path: "/user",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::User::Types::User.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
