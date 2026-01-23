# frozen_string_literal: true

module FernExhaustive
  module Types
    module Object_
      module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
          field :string, -> { String }, optional: true, nullable: false
          field :nested_object, -> { FernExhaustive::Types::Object_::Types::ObjectWithOptionalField }, optional: true, nullable: false, api_name: "NestedObject"
        end
      end
    end
  end
end
