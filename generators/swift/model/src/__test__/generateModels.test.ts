import { generateModels } from "../generateModels"
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext"

const testDefinitions = ["basic-object", "linked-objects"] as const

describe.each(testDefinitions)("generateModels - %s", (testDefinitionName) => {
    it("should correctly generate model files", async () => {
        const context = await createSampleGeneratorContext(testDefinitionName)
        const files = generateModels({ context })
        for (const file of files) {
            await expect(file.fileContents).toMatchFileSnapshot(`snapshots/${testDefinitionName}/${file.filename}`)
        }
    })
})
