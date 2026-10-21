# frozen_string_literal: true

require_relative "../.."

module Seed
  module Common
    module Types
      class BaseType < Internal::Types::Model
        field :child_ref, -> { Seed::Common::Types::ChildType }, optional: true, nullable: false
      end
    end
  end
end
