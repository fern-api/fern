```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.test();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.updateTestSubmissionStatus(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		{ type : "stopped" }
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.admin.sendTestSubmissionUpdate(
  "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  {
    updateTime: "2024-01-15T09:30:00Z",
  }
);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.updateWorkspaceSubmissionStatus(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		{ type : "stopped" }
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.admin.sendWorkspaceSubmissionUpdate(
  "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  {
    updateTime: "2024-01-15T09:30:00Z",
  }
);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedTestCase(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	"testCaseId",
	{
		result: {
			result: {
				expectedResult: expectedResult: { 
					type : "integerValue", 
					value: 1
				},
				actualResult: actualResult: { 
					type : "value", 
					value: value: { 
						type : "integerValue", 
						value: 1
					}
				},
				passed: true
			},
			stdout: "stdout"
		},
		traceResponses: [
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			},
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedTestCaseV2(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	"testCaseId",
	{
		[
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "filename",
					directory: "directory"
				},
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			},
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "filename",
					directory: "directory"
				},
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedWorkspace(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		workspaceRunDetails: {
			exceptionV2: exceptionV2: { 
				type : "generic", 
				exceptionType: "exceptionType",
				exceptionMessage: "exceptionMessage",
				exceptionStacktrace: "exceptionStacktrace"
			},
			exception: {
				exceptionType: "exceptionType",
				exceptionMessage: "exceptionMessage",
				exceptionStacktrace: "exceptionStacktrace"
			},
			stdout: "stdout"
		},
		traceResponses: [
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			},
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedWorkspaceV2(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		[
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "filename",
					directory: "directory"
				},
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			},
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "filename",
					directory: "directory"
				},
				returnValue: returnValue: { 
					type : "integerValue", 
					value: 1
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "methodName",
						lineNumber: 1
					}
				},
				stdout: "stdout"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.homepage.getHomepageProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.homepage.setHomepageProblems(
	{
		[
			"string",
			"string"
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.migration.getAttemptedMigrations(
	{
		admin-key-header: "admin-key-header"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.createPlaylist(1, {
  datetime: "2024-01-15T09:30:00Z",
  optionalDatetime: "2024-01-15T09:30:00Z",
  name: "name",
  problems: ["problems", "problems"],
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylists(1, {
  limit: 1,
  otherField: "otherField",
  multiLineDocs: "multiLineDocs",
  optionalMultipleField: "optionalMultipleField",
  multipleField: "multipleField",
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylist(1, "playlistId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.updatePlaylist(1, "playlistId", {
  name: "name",
  problems: ["problems", "problems"],
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.deletePlaylist(1, "playlist_id");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.createProblem(
	{
		problemName: "problemName",
		problemDescription: {
				boards: [
					{ 
						type : "html", 
						value: "boards"
					},
					{ 
						type : "html", 
						value: "boards"
					}
				]
			},
		files: {
				"JAVA": {
					solutionFile: {
						filename: "filename",
						contents: "contents"
					}
				}
			},
		inputParams: [
				{
					variableType: variableType: { type : "integerType" },
					name: "name"
				},
				{
					variableType: variableType: { type : "integerType" },
					name: "name"
				}
			],
		outputType: outputType: { type : "integerType" },
		testcases: [
				{
					testCase: {
						id: "id"
					},
					expectedResult: expectedResult: { 
						type : "integerValue", 
						value: 1
					}
				},
				{
					testCase: {
						id: "id"
					},
					expectedResult: expectedResult: { 
						type : "integerValue", 
						value: 1
					}
				}
			],
		methodName: "methodName"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.updateProblem(
	"problemId",
	{
		problemName: "problemName",
		problemDescription: {
				boards: [
					{ 
						type : "html", 
						value: "boards"
					},
					{ 
						type : "html", 
						value: "boards"
					}
				]
			},
		files: {
				"JAVA": {
					solutionFile: {
						filename: "filename",
						contents: "contents"
					}
				}
			},
		inputParams: [
				{
					variableType: variableType: { type : "integerType" },
					name: "name"
				},
				{
					variableType: variableType: { type : "integerType" },
					name: "name"
				}
			],
		outputType: outputType: { type : "integerType" },
		testcases: [
				{
					testCase: {
						id: "id"
					},
					expectedResult: expectedResult: { 
						type : "integerValue", 
						value: 1
					}
				},
				{
					testCase: {
						id: "id"
					},
					expectedResult: expectedResult: { 
						type : "integerValue", 
						value: 1
					}
				}
			],
		methodName: "methodName"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.problem.deleteProblem("problemId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.getDefaultStarterFiles(
	{
		inputParams: [
			{
				variableType: variableType: { type : "integerType" },
				name: "name"
			},
			{
				variableType: variableType: { type : "integerType" },
				name: "name"
			}
		],
		outputType: outputType: { type : "integerType" },
		methodName: "methodName"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
undefined;
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.getExecutionSession("sessionId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.stopExecutionSession("sessionId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.getExecutionSessionsState();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.sysprop.setNumWarmInstances(1);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.sysprop.getNumWarmInstances();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getLightweightProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getLatestProblem("problemId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getProblemVersion("problemId", 1);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getLightweightProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getLatestProblem("problemId");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getProblemVersion("problemId", 1);
 
```                        


