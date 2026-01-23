# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    module Types
      class MetadataUnion < Internal::Types::Model
        extend FernUndiscriminatedUnions::Internal::Types::Union

        member -> { Internal::Types::Hash[String, Object] }
        member -> { FernUndiscriminatedUnions::Union::Types::NamedMetadata }
      end
    end
  end
end
