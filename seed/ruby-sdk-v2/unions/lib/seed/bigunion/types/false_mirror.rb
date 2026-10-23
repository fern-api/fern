# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Bigunion
    module Types
      class FalseMirror < Internal::Types::Model
        field :value, -> { String }, optional: false, nullable: false
      end
    end
  end
end
