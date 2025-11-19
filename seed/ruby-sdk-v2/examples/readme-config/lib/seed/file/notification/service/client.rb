# frozen_string_literal: true

module Seed
  module File
    module Notification
      module Service
        class Client
          # @return [Seed::File::Notification::Service::Client]
          def initialize(client:)
            @client = client
          end

          # @return [Seed::Types::Types::Exception]
          def get_exception(request_options: {}, **params)
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/file/notification/#{params[:notification_id]}"
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::Types::Types::Exception.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end
      end
    end
  end
end
