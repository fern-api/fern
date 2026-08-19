# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Tests that unknown/any values containing backslashes in map keys
        # are properly escaped in Go string literals.
        class ObjectWithUnknownField < Internal::Types::Model
          field :unknown, -> { Object }, optional: false, nullable: false
        end
      end
    end
  end
end
