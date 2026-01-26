# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Types
    class UnionResponse < Internal::Types::Model
      field :data, -> { FernUndiscriminatedUnionWithResponseProperty::Types::MyUnion }, optional: false, nullable: false
    end
  end
end
