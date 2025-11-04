# frozen_string_literal: true

module Seed
  module Union
    module Types
      class MetadataUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Hash[String, Internal::Types::Hash[String, Object]] }
        member -> { Seed::Union::Types::NamedMetadata }
      end
    end
  end
end
