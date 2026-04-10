# frozen_string_literal: true

module Seed
  module Types
    class MetadataUnion < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Internal::Types::Hash[String, Object] }
      member -> { Seed::Types::NamedMetadata }
    end
  end
end
