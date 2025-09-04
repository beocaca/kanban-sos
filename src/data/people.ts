import type { Person, ColumnType, ColumnMap } from '../types'

// Avatar data URLs (simplified for demo)
const avatarMap: Record<string, string> = {
  Alexander: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23FF5630"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
  Aliza: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%2357D9A3"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
  Alvin: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%230065FF"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
  Angie: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%2300C7E5"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
  Arjun: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%2300C7E5"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
  Blair: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%230065FF"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EB%3C/text%3E%3C/svg%3E',
  Claudia: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23FFAB00"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EC%3C/text%3E%3C/svg%3E',
  Colin: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%236554C0"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EC%3C/text%3E%3C/svg%3E',
  Ed: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%238777D9"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EE%3C/text%3E%3C/svg%3E',
  Effie: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23FFAB00"/%3E%3Ctext x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold"%3EE%3C/text%3E%3C/svg%3E',
};

const names: string[] = Object.keys(avatarMap);

const roles: string[] = [
  'Engineer',
  'Senior Engineer',
  'Principal Engineer',
  'Engineering Manager',
  'Designer',
  'Senior Designer',
  'Lead Designer',
  'Design Manager',
  'Content Designer',
  'Product Manager',
  'Program Manager',
];

let sharedLookupIndex: number = 0;

export function getPerson(): Person {
  sharedLookupIndex++;
  return getPersonFromPosition({ position: sharedLookupIndex });
}

export function getPersonFromPosition({ position }: { position: number }): Person {
  const name = names[position % names.length];
  const role = roles[position % roles.length];
  return {
    userId: `id:${position}`,
    name,
    role,
    avatarUrl: avatarMap[name],
  };
}

export function getPeople({ amount }: { amount: number }): Person[] {
  return Array.from({ length: amount }, () => getPerson());
}

export function getBasicData() {
  const columnMap: ColumnMap = {
    confluence: {
      title: 'Confluence',
      columnId: 'confluence',
      items: getPeople({ amount: 10 }),
    },
    jira: {
      title: 'Jira',
      columnId: 'jira',
      items: getPeople({ amount: 10 }),
    },
    trello: {
      title: 'Trello',
      columnId: 'trello',
      items: getPeople({ amount: 10 }),
    },
  };

  const orderedColumnIds = ['confluence', 'jira', 'trello'];

  return {
    columnMap,
    orderedColumnIds,
  };
}