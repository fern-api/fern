# frozen_string_literal: true

module Seed
  module Types
    class EndpointsPaginatedResponse < Internal::Types::Model
      field :items, -> { Internal::Types::Array[Seed::Types::TypesObjectWithRequiredField] }, optional: false, nullable: false
      field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
    end
  end
end
