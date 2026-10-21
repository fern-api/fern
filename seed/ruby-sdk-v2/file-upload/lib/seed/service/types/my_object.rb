# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      class MyObject < Internal::Types::Model
        field :foo, -> { String }, optional: false, nullable: false
      end
    end
  end
end
