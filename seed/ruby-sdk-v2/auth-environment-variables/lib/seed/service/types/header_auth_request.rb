# frozen_string_literal: true

module Seed
  module Service
    module Types
      class HeaderAuthRequest < Internal::Types::Model
        field :x_endpoint_header, -> { String }, optional: false, nullable: false, api_name: "X-Endpoint-Header"
      end
    end
  end
end
