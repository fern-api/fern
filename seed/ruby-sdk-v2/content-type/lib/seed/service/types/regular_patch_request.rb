# frozen_string_literal: true

module Seed
  module Service
    module Types
      class RegularPatchRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :field_1, -> { String }, optional: true, nullable: false, api_name: "field1"
        field :field_2, -> { Integer }, optional: true, nullable: false, api_name: "field2"
      end
    end
  end
end
