# frozen_string_literal: true

module Seed
  module FolderB
    module Common
      module Types
        class Foo < Internal::Types::Model
          field :foo, -> { Seed::FolderC::Common::Types::FolderCFoo }, optional: true, nullable: false
        end
      end
    end
  end
end
