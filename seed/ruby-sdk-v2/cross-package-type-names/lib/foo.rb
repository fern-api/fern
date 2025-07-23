# frozen_string_literal: true

module FolderC
    module Types
        class Foo < Internal::Types::Model
            field :bar_property, String, optional: true, nullable: true
        end
    end
end
