# frozen_string_literal: true

module Seed
  module Endpoints
    module Put
      class Client
        # @return [Seed::Endpoints::Put::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Endpoints::Put::Types::PutResponse]
        def add(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: params[:id].to_s
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Endpoints::Put::Types::PutResponse.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
