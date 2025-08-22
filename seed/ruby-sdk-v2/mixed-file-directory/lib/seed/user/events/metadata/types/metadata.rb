# frozen_string_literal: true

module Seed
  module User
    module Events
      module Metadata
        module Types
          class Metadata < Internal::Types::Model
            field :id, -> { String }, optional: false, nullable: false
            field :value, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
