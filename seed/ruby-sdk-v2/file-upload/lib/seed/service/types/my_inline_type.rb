# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      class MyInlineType < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
      end
    end
  end
end
