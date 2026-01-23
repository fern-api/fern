# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Types
    class UnionListResponse < Internal::Types::Model
      field :data, -> { Internal::Types::Array[FernUndiscriminatedUnionWithResponseProperty::Types::MyUnion] }, optional: false, nullable: false
    end
  end
end
