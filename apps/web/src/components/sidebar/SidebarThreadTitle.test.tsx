import type { ServerProviderSkill } from "@t3tools/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { resolveSidebarSkills, SidebarThreadTitle } from "./SidebarThreadTitle";

const mockSkills: ServerProviderSkill[] = [
  {
    name: "wayfinder",
    displayName: "Wayfinder",
    description: "Codebase navigator",
    path: "/skills/wayfinder",
    enabled: true,
  },
  {
    name: "code-review",
    displayName: "Code Review",
    description: "Multi-axis review",
    path: "/skills/code-review",
    enabled: true,
  },
];

describe("SidebarThreadTitle", () => {
  it("renders plain title when no skills match or skills list is empty", () => {
    const markup = renderToStaticMarkup(
      <SidebarThreadTitle title="Simple conversation" skills={[]} />,
    );
    expect(markup).toBe("Simple conversation");
  });

  it("renders plain title when skills prop is undefined", () => {
    const markup = renderToStaticMarkup(<SidebarThreadTitle title="Simple conversation" />);
    expect(markup).toBe("Simple conversation");
  });

  it("renders skill badge when title starts with $skill", () => {
    const markup = renderToStaticMarkup(
      <SidebarThreadTitle title="$wayfinder 769" skills={mockSkills} />,
    );
    expect(markup).toContain('data-slot="context-chip"');
    expect(markup).toContain('data-slot="context-chip-label"');
    expect(markup).toContain("Wayfinder");
    expect(markup).toContain(" 769");
    expect(markup).toContain("<svg");
  });

  it("renders skill badge when title contains skill in the middle", () => {
    const markup = renderToStaticMarkup(
      <SidebarThreadTitle title="Investigating with $code-review today" skills={mockSkills} />,
    );
    expect(markup).toContain("Investigating with ");
    expect(markup).toContain('data-slot="context-chip"');
    expect(markup).toContain("Code Review");
    expect(markup).toContain(" today");
  });

  it("does not render badge for monetary amounts or dollar numbers", () => {
    const markup = renderToStaticMarkup(
      <SidebarThreadTitle title="$20 per user" skills={mockSkills} />,
    );
    expect(markup).toBe("$20 per user");
    expect(markup).not.toContain("context-chip");
  });

  it("does not render badge for unknown skill tokens", () => {
    const markup = renderToStaticMarkup(
      <SidebarThreadTitle title="$unknown-skill test" skills={mockSkills} />,
    );
    expect(markup).toBe("$unknown-skill test");
    expect(markup).not.toContain("context-chip");
  });
});

describe("resolveSidebarSkills", () => {
  it("returns skills from providerEntry when available", () => {
    const skills = resolveSidebarSkills({ skills: mockSkills });
    expect(skills).toEqual(mockSkills);
  });

  it("falls back to skills in providerEntryByInstanceId when providerEntry has no skills", () => {
    const byInstance = new Map([
      ["p1", { skills: [] }],
      ["p2", { skills: mockSkills }],
    ]);
    const skills = resolveSidebarSkills(null, byInstance);
    expect(skills).toEqual(mockSkills);
  });

  it("returns empty array when no skills exist anywhere", () => {
    const skills = resolveSidebarSkills(null, new Map());
    expect(skills).toEqual([]);
  });
});
