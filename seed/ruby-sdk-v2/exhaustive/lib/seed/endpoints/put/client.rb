# frozen_string_literal: true

module Seed
  module Endpoints
    module Put
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::Put::Client]
        def initialize(client:)
          @client = client
        end

        # @option params [String] :id
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [Seed::Endpoints::Put::Types::PutResponse]
        def add(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: params[:id].to_s
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Endpoints::Put::Types::PutResponse.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
