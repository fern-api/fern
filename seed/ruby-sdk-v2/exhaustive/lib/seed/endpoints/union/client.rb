# frozen_string_literal: true

module Seed
  module Endpoints
    module Union
      class Client
        # @return [Seed::Endpoints::Union::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Types::Union::Types::Animal]
        def get_and_return_union(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/union",
            body: Seed::Types::Union::Types::Animal.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Union::Types::Animal.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
