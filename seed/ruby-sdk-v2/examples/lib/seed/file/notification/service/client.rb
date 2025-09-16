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
              path: "/file/notification/#{params[:notificationId]}"
            )
            _response = @client.send(_request)
            if _response.code >= "200" && _response.code < "300"
              return Seed::Types::Types::Exception.load(_response.body)
            end

            raise _response.body
          end
        end
      end
    end
  end
end
