# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Reference
    module Types
      class ContainerObject < Internal::Types::Model
        field :nested_objects, -> { Internal::Types::Array[Seed::Reference::Types::NestedObjectWithLiterals] }, optional: false, nullable: false, api_name: "nestedObjects"
      end
    end
  end
end
