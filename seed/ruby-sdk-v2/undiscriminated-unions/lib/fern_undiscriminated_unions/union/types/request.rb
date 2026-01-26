# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      class Request < Internal::Types::Model
        field :union, -> { FernUndiscriminatedUnions::Union::Types::MetadataUnion }, optional: true, nullable: false
      end
    end
  end
end
