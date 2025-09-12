
module Seed
  module PathParam
    class Client
      # @return [Seed::PathParam::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def send(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "path/#{/#{"
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
