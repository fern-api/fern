# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServicePostRequest < Internal::Types::Model
        field :endpoint_param, -> { String }, optional: false, nullable: false, api_name: "endpointParam"
      end
    end
  end
end
