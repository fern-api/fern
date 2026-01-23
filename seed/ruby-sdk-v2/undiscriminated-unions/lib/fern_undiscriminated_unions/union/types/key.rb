# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      class Key < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { FernUndiscriminatedUnions::Union::Types::KeyType }
        member -> { String }
      end
    end
  end
end
