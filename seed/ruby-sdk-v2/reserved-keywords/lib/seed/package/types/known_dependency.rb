# frozen_string_literal: true

require_relative "../.."

module Seed
  module Package
    module Types
      class KnownDependency < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
