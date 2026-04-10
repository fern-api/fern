# frozen_string_literal: true

module Seed
  module Types
    class V2V3DefaultProvidedFile < Internal::Types::Model
      field :file, -> { Seed::Types::V2V3FileInfoV2 }, optional: false, nullable: false
      field :related_types, -> { Internal::Types::Array[Seed::Types::VariableType] }, optional: false, nullable: false, api_name: "relatedTypes"
    end
  end
end
