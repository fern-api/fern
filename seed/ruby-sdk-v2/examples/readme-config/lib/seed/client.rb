

module Seed
  class Client
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(base_url: nil, token:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url || Seed::Environment::PRODUCTION,
        headers: {
          "User-Agent" => "fern_examples/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end
    # @return [Seed::::Client]
    def 
      @ ||= Seed::::Client.new(client: @raw_client)
    end
    # @return [Seed::FileNotificationService::Client]
    def file_notification_service
      @file_notification_service ||= Seed::FileNotificationService::Client.new(client: @raw_client)
    end
    # @return [Seed::FileService::Client]
    def file_service
      @file_service ||= Seed::FileService::Client.new(client: @raw_client)
    end
    # @return [Seed::HealthService::Client]
    def health_service
      @health_service ||= Seed::HealthService::Client.new(client: @raw_client)
    end
    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
if code.between?(200, 299)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Types::Type]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Types::Identifier]
      def create_type(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "type",
          body: Seed::Types::Type.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Identifier.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

    end
  end
end
