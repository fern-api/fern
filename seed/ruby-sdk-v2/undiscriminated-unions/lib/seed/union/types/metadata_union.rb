# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class MetadataUnion < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Hash[String, Object] }

        member -> { Seed::Union::Types::NamedMetadata }
      end
    end
  end
end
