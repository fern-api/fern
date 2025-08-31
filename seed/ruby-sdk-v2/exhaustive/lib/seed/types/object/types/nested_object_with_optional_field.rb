# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
          field :string, -> { String }, optional: true, nullable: false
          field :nested_object, lambda {
            Seed::Types::Object_::Types::ObjectWithOptionalField
          }, optional: true, nullable: false
        end
      end
    end
  end
end
