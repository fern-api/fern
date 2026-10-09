# frozen_string_literal: true

module Seed
  module Types
    module Types
      class TypeWithOptionalReferenceMap < Internal::Types::Model
        field :references, -> { Internal::Types::Hash[String, Seed::Types::Types::Foo] }, optional: false, nullable: false

        field :metadata, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
      end
    end
  end
end
