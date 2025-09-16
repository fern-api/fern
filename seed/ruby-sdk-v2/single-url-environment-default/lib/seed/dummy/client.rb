
module Seed
  module Dummy
    class Client
      # @return [Seed::Dummy::Client]
      def initialize(client:)
        @client = client
      end

      # @return [String]
      def get_dummy(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Production
          ,
          method: "GET",
          path: "dummy"
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
