

module Seed
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_alias/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
    # @return [Seed::::Client]
    def 
      @ ||= Seed::::Client.new(client: @raw_client)
    end
  end
end
tional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Types::TypeID] :type_id
      #
      # @return [untyped]
      def get(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "#{URI.encode_uri_component(params[:type_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          return
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

    end
  end
end
