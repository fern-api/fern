# frozen_string_literal: true

module Seed
  module Headers
    module Types
      class HeadersSendRequest < Internal::Types::Model
        field :endpoint_version, -> { Seed::Headers::Types::HeadersSendRequestXEndpointVersion }, optional: false, nullable: false, api_name: "X-Endpoint-Version"
        field :async, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "X-Async"
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
