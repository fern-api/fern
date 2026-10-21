# frozen_string_literal: true

require_relative "../.."

module Seed
  module Union
    module Types
      class NamedMetadata < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false

        field :value, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
      end
    end
  end
end
