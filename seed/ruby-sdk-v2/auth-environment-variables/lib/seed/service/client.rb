
module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # GET request with custom api key
      #
      # @return [String]
      def get_with_api_key(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "GET",
          path: "apiKey"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # GET request with custom api key
      #
      # @return [String]
      def get_with_header(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "GET",
          path: "apiKeyInHeader",
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
