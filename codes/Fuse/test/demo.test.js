import Fuse from "../src/entry";
import * as ErrorMsg from "../src/core/errorMessages";

const data = [
  {
    title: "Most popular functions and keywords",
    name: "most-popular",
    subSections: [
      {
        name: "parentsOfIssuesInQuery",
        description:
          "Find the parents of the issues returned from the subquery (defined in parentheses).",
        examples: [
          {
            note: "Find all the parents of epics in my ACME project:",
            snippet: [
              `issue in parentsOfIssuesInQuery("project='ACME' and type=Epic")`,
            ],
          },
        ],
      },
      {
        name: "linkedIssuesOfQuery",
        description:
          "Find issues linked to the issues returned from the subquery (defined in parentheses).",
        examples: [
          {
            note: "Finds issues that block my project ACME:",
            snippet: [
              `issue in linkedIssuesOfQuery("project=ACME", "is blocked by")`,
            ],
          },
          {
            note: "Finds issues that are linked with epics that are in To Do:",
            snippet: [
              `issue in linkedIssuesOfQuery("type=Epic AND status='To Do'")`,
            ],
          },
        ],
      },
    ],
  },
];

describe("Demo", () => {
  test("Demo", () => {
    const fuse = new Fuse(data, {
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
      keys: [
        "title",
        "subSections.examples.note",
        "subSections.examples.snippet",
      ],
    });
    const result = fuse.search("isue");
    expect(result).toMatchSnapshot();
  });
});
