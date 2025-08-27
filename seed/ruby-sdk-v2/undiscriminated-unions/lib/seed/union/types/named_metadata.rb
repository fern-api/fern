# frozen_string_literal: true

module Seed
  module Union
    module Types
      class NamedMetadata < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :value, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: false, nullable: false
      end
    end
  end
end
