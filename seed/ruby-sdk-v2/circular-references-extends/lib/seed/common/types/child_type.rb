# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Common
    module Types
      class ChildType < Internal::Types::Model
        field :child_ref, -> { Seed::Common::Types::ChildType }, optional: true, nullable: false

        field :child_name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
