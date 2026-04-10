# frozen_string_literal: true

module Seed
  class MyClient
    # @param base_url [String, nil]
    # @param token [String]
    #
    # @return [void]
    def initialize(token:, base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_exhaustive/0.0.1",
          "X-Fern-Language" => "Ruby",
          Authorization: "Bearer #{token}"
        }
      )
    end

    # @return [Seed::EndpointsContainer::Client]
    def endpoints_container
      @endpoints_container ||= Seed::EndpointsContainer::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsContentType::Client]
    def endpoints_content_type
      @endpoints_content_type ||= Seed::EndpointsContentType::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsEnum::Client]
    def endpoints_enum
      @endpoints_enum ||= Seed::EndpointsEnum::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsHTTPMethods::Client]
    def endpoints_http_methods
      @endpoints_http_methods ||= Seed::EndpointsHTTPMethods::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsObject::Client]
    def endpoints_object
      @endpoints_object ||= Seed::EndpointsObject::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsPagination::Client]
    def endpoints_pagination
      @endpoints_pagination ||= Seed::EndpointsPagination::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsParams::Client]
    def endpoints_params
      @endpoints_params ||= Seed::EndpointsParams::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsPrimitive::Client]
    def endpoints_primitive
      @endpoints_primitive ||= Seed::EndpointsPrimitive::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsPut::Client]
    def endpoints_put
      @endpoints_put ||= Seed::EndpointsPut::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsUnion::Client]
    def endpoints_union
      @endpoints_union ||= Seed::EndpointsUnion::Client.new(client: @raw_client)
    end

    # @return [Seed::EndpointsUrLs::Client]
    def endpoints_ur_ls
      @endpoints_ur_ls ||= Seed::EndpointsUrLs::Client.new(client: @raw_client)
    end

    # @return [Seed::Inlinedrequests::Client]
    def inlinedrequests
      @inlinedrequests ||= Seed::Inlinedrequests::Client.new(client: @raw_client)
    end

    # @return [Seed::Noauth::Client]
    def noauth
      @noauth ||= Seed::Noauth::Client.new(client: @raw_client)
    end

    # @return [Seed::Noreqbody::Client]
    def noreqbody
      @noreqbody ||= Seed::Noreqbody::Client.new(client: @raw_client)
    end

    # @return [Seed::Reqwithheaders::Client]
    def reqwithheaders
      @reqwithheaders ||= Seed::Reqwithheaders::Client.new(client: @raw_client)
    end
  end
end
