# frozen_string_literal: true

module Seed
  module FolderA
    module Service
      class Client
        # @return [Seed::FolderA::Service::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::FolderA::Service::Types::Response]
        def get_direct_thread(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: ""
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::FolderA::Service::Types::Response.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
