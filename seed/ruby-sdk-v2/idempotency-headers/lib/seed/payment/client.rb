
module Seed
  module Payment
    class Client
      # @return [Seed::Payment::Client]
      def initialize(client:)
        @client = client
      end

      # @return [String]
      def create(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "POST",
          path: "/payment",
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # @return [untyped]
      def delete(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "DELETE",
          path: "/payment/#{params[:paymentId]}"
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
