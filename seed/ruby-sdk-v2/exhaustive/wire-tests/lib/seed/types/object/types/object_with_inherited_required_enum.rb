# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # A base object that has a required enum field, preventing Default derive
        # in Rust because enums don't implement Default.
        class ObjectWithInheritedRequiredEnum < Internal::Types::Model
          field :required_enum, -> { Seed::Types::Enum::Types::WeatherReport }, optional: false, nullable: false, api_name: "requiredEnum"

          field :required_string, -> { String }, optional: false, nullable: false, api_name: "requiredString"
        end
      end
    end
  end
end
