# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
        # This type should NOT derive Default in Rust because the parent type
        # has a required enum field.
        class ExtendedObjectWithInheritedEnum < Internal::Types::Model
          field :required_enum, -> { Seed::Types::Enum::Types::WeatherReport }, optional: false, nullable: false, api_name: "requiredEnum"

          field :required_string, -> { String }, optional: false, nullable: false, api_name: "requiredString"

          field :optional_description, -> { String }, optional: true, nullable: false, api_name: "optionalDescription"
        end
      end
    end
  end
end
