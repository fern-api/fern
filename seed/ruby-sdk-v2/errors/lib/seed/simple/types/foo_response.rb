# frozen_string_literal: true

require_relative "../.."

module Seed
  module Simple
    module Types
      class FooResponse < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
      end
    end
  end
end
