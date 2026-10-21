# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      class WithDocs < Internal::Types::Model
        field :docs, -> { String }, optional: false, nullable: false
      end
    end
  end
end
