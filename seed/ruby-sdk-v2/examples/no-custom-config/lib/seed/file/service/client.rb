# frozen_string_literal: true

module Seed
  module File
    module Service
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::File::Service::Client]
        def initialize(client:)
          @client = client
        end

        # This endpoint returns a file by its name.
        #
        # @option params [String] :filename
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [Seed::Types::Types::File]
        def get_file(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/file/#{params[:filename]}"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Types::File.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
