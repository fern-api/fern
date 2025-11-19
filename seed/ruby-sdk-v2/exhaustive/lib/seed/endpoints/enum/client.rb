# frozen_string_literal: true

module Seed
  module Endpoints
    module Enum
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::Enum::Client]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Seed::RequestOptions]
        #
        # @param params [Seed::Types::Enum::Types::WeatherReport]
        #
        # @return [Seed::Types::Enum::Types::WeatherReport]
        def get_and_return_enum(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/enum",
            body: Seed::Types::Enum::Types::WeatherReport.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Enum::Types::WeatherReport.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
