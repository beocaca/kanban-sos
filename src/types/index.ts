export interface Person {
  userId: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ColumnType {
  title: string;
  columnId: string;
  items: Person[];
}

export type ColumnMap = { [columnId: string]: ColumnType };

export type Outcome =
  | {
      type: 'column-reorder';
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: 'card-reorder';
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: 'card-move';
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn: number;
    };

export type Trigger = 'pointer' | 'keyboard';

export interface Operation {
  trigger: Trigger;
  outcome: Outcome;
}

export interface BoardState {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  lastOperation: Operation | null;
}

export interface CardEntry {
  element: HTMLElement;
  actionMenuTrigger: HTMLElement;
}

export interface ColumnEntry {
  element: HTMLElement;
}