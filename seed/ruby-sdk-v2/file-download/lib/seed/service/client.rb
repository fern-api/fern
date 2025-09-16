
module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def simple(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "POST",
          path: "/snippet"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # @return [untyped]
      def download_file(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "POST",
          path: ""
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
