# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module FolderB
    module Common
      module Types
        class Foo < Internal::Types::Model
          field :foo, -> { Seed::FolderC::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
