# frozen_string_literal: true

module Seed
  module Derived
    module Types
      class DerivedType < Internal::Types::Model
        field :derived_name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
