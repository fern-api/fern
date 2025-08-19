# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
          field :string, -> { String }, optional: false, nullable: false
          field :nested_object, -> { Seed::Types::Object_::Types::ObjectWithOptionalField }, optional: false, nullable: false

        end
      end
    end
  end
end
