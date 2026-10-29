import type { ServerProviderSkill } from "@t3tools/contracts";
import { formatProviderSkillDisplayName, matchInlineSkills } from "@t3tools/shared/inlineSkills";
import type { ReactNode } from "react";
import { ContextChip, ContextChipLabel } from "../ContextChip";
import { SKILL_CHIP_ICON_SVG } from "../composerInlineChip";

export interface SidebarSkillsSourceEntry {
  readonly skills?: ReadonlyArray<ServerProviderSkill> | undefined;
}

export function resolveSidebarSkills<Entry extends SidebarSkillsSourceEntry>(
  providerEntry: Entry | null | undefined,
  providerEntryByInstanceId?: ReadonlyMap<string, Entry> | undefined,
): ReadonlyArray<ServerProviderSkill> {
  if (providerEntry?.skills && providerEntry.skills.length > 0) {
    return providerEntry.skills;
  }
  if (!providerEntryByInstanceId || providerEntryByInstanceId.size === 0) {
    return [];
  }
  const allSkills: ServerProviderSkill[] = [];
  const seen = new Set<string>();
  for (const entry of providerEntryByInstanceId.values()) {
    for (const skill of entry.skills ?? []) {
      if (!seen.has(skill.name)) {
        seen.add(skill.name);
        allSkills.push(skill);
      }
    }
  }
  return allSkills;
}

export function SidebarThreadTitle(props: {
  title: string;
  skills?: ReadonlyArray<ServerProviderSkill> | undefined;
}) {
  const skills = props.skills;
  if (!skills || skills.length === 0) {
    return <>{props.title}</>;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const { start, end, skill } of matchInlineSkills(props.title, skills)) {
    if (start > cursor) {
      nodes.push(props.title.slice(cursor, start));
    }
    nodes.push(
      <ContextChip
        key={`${start}:${skill.name}`}
        kind="skill"
        className="pointer-events-none select-none max-w-full align-baseline"
      >
        <span
          aria-hidden="true"
          className="contents"
          dangerouslySetInnerHTML={{ __html: SKILL_CHIP_ICON_SVG }}
        />
        <ContextChipLabel>{formatProviderSkillDisplayName(skill)}</ContextChipLabel>
      </ContextChip>,
    );
    cursor = end;
  }

  if (cursor === 0) {
    return <>{props.title}</>;
  }
  if (cursor < props.title.length) {
    nodes.push(props.title.slice(cursor));
  }
  return <>{nodes}</>;
}
