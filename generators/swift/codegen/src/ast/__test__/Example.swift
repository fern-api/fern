// Sample.swift

import Foundation
import UIKit

open class Room {

    class Person {

        func getName() {
            print("Hey!")
        }

    }

    enum RoomType {
        case big
        case small = sml
    }

    func openDoor() {
        print("Hey!")
    }

    public static func closeDoor() async throws -> Int {
        print("Hey!")
    }

}
