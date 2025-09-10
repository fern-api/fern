
module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def download(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "download-content/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
        else
          raise _response.body
        end
      end

    end
  end
end
