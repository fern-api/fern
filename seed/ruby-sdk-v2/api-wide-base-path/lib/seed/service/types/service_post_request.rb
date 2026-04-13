# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServicePostRequest < Internal::Types::Model
        field :path_param, -> { String }, optional: false, nullable: false, api_name: "pathParam"
        field :service_param, -> { String }, optional: false, nullable: false, api_name: "serviceParam"
        field :endpoint_param, -> { Integer }, optional: false, nullable: false, api_name: "endpointParam"
        field :resource_param, -> { String }, optional: false, nullable: false, api_name: "resourceParam"
      end
    end
  end
end
