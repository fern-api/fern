# frozen_string_literal: true

module Seed
  module Endpoints
    module Enum
      class Client
        # @return [Seed::Endpoints::Enum::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Types::Enum::Types::WeatherReport]
        def get_and_return_enum(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/enum",
            body: Seed::Types::Enum::Types::WeatherReport.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Enum::Types::WeatherReport.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
