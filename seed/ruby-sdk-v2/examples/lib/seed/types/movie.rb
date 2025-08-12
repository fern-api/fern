
module Seed
    module Types
        class Movie < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :prequel, , optional: true, nullable: false
            field :title, , optional: false, nullable: false
            field :from, , optional: false, nullable: false
            field :rating, , optional: false, nullable: false
            field :type, , optional: false, nullable: false
            field :tag, , optional: false, nullable: false
            field :book, , optional: true, nullable: false
            field :metadata, , optional: false, nullable: false
            field :revenue, , optional: false, nullable: false
        end
    end
end
