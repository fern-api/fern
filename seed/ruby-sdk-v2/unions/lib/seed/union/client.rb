
module Seed
  module Union
    class Client
      # @return [Seed::Union::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Union::Types::Shape]
      def get(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Union::Types::Shape.load(_response.body)
        else
          raise _response.body
        end
      end

      # @return [bool]
      def update(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "",
          body: Seed::Union::Types::Shape.new(params).to_h,
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
