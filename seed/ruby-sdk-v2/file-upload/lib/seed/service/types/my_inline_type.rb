# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Service
    module Types
      class MyInlineType < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
      end
    end
  end
end
